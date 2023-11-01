

import frappe 
from frappe import _
from erpnext.crm.doctype.appointment.appointment import Appointment, _get_employee_from_user, _get_agents_sorted_by_asc_workload
from frappe.utils import get_url, getdate, now
from datetime import datetime # from python std library
from frappe.utils import add_to_date

class CustomAppointment(Appointment):
    def find_contact_by_email(self):
        contact_list = frappe.db.sql("""
            SELECT t0.*
                FROM `tabContact Email` AS t0
                LEFT OUTER JOIN `tabContact` AS t1
                    ON t0.parent = t1.name
                WHERE t0.email_id = %(mail)s
            """, values={
                'mail' : self.customer_email
            }, as_dict=1)
        if contact_list:
            return contact_list[0].parent
        return None

    def before_insert(self):
        number_of_appointments_in_same_slot = frappe.db.count(
            "Appointment", filters={"scheduled_time": self.scheduled_time}
        )
        number_of_agents = frappe.db.get_single_value("Appointment Booking Settings", "number_of_agents")
        if not number_of_agents == 0:
            if number_of_appointments_in_same_slot >= number_of_agents:
                frappe.throw(_("Time slot is not available"))
        # Link lead
        if not self.party:
            lead = self.find_lead_by_email()
            customer = self.find_customer_by_email()
            contact = self.find_contact_by_email()
            if customer:
                self.appointment_with = "Customer"
                self.party = customer
            elif contact :
                self.appointment_with = "Contact"
                self.party = contact
            else:
                self.appointment_with = "Lead"
                self.party = lead
    
    def create_calendar_event(self):
        if self.calendar_event:
            return

        if self.custom_description : _subject = self.custom_description
        else : _subject = " ".join(["Rendez-vous avec", self.customer_name])
        
        _description = (self.custom_description or "") + \
            "\n" + (self.appointment_with if ("Description du " + _(self.appointment_with or "") + " : " + "\n" + (self.customer_details or "")) else "") 
            
        if self.vae : 
            _vae = frappe.get_doc('VAE', self.vae)
            _description += f'\n \n <a href="./app/vae/{self.vae}"> Rendez vous pour VAE </a>'
        
        appointment_event = frappe.get_doc(
            {
                "doctype": "Event",
                "subject": _subject,
                "starts_on": self.scheduled_time,
                "status": "Open",
                "type": "Public",
                "description" : _description,
                "send_reminder": frappe.db.get_single_value("Appointment Booking Settings", "email_reminders"),
                "event_participants": [
                    dict(reference_doctype=self.appointment_with, reference_docname=self.party)
                ],
            }
        )
        

        employee = _get_employee_from_user(self._assign)
        if employee:
            appointment_event.append(
                "event_participants", dict(reference_doctype="Employee", reference_docname=employee.name)
            )
        appointment_event.insert(ignore_permissions=True)
        self.calendar_event = appointment_event.name
        self.save(ignore_permissions=True)
        
    def auto_assign(self):
        if self.assign_to : 
            self.assign_agent(self.assign_to)
            return
        existing_assignee = self.get_assignee_from_latest_opportunity()
        if existing_assignee:
            # If the latest opportunity is assigned to someone
            # Assign the appointment to the same
            self.assign_agent(existing_assignee)
            return
        if self._assign:
            return
        available_agents = _get_agents_sorted_by_asc_workload(getdate(self.scheduled_time))
        for agent in available_agents:
            if _check_agent_availability(agent, self.scheduled_time):
                self.assign_agent(agent[0])
            break
        
    def send_confirmation_email(self):
        if self.customer_email : 
            super().send_confirmation_email()
            
    def on_change(self):
        super().on_change()
        print(self.scheduled_time)
        if type(self.scheduled_time) == str : self.scheduled_time = datetime.strptime(self.scheduled_time, "%Y-%m-%d %H:%M:%S")
        if type(self.durée) == str : self.durée = int(self.durée)
        self.heure_de_fin = add_to_date(self.scheduled_time, seconds=self.durée, as_datetime=True)
        if self.calendar_event :
            cal_event = frappe.get_doc("Event", self.calendar_event)
            if self.status in ["Closed", "Cancelled"] : 
                cal_event.status = "Cancelled"
                cal_event.save(ignore_permissions=True)
            if self.status in ["Open", "Unverified"] : 
                cal_event.status = "Open"
                cal_event.save(ignore_permissions=True)
        
    def before_save(self):
        # super().val TODO: check on update
        if self.calendar_event :
            cal_event = frappe.get_doc("Event", self.calendar_event)
            if cal_event.status == "Completed" : self.status = "Close"
            if cal_event.status == "Cancelled" : self.status = "Cancelled"
        
def _check_agent_availability(agent_email, scheduled_time):
    appointemnts_at_scheduled_time = frappe.get_all(
        "Appointment", filters={"scheduled_time": scheduled_time}
    )
    for appointment in appointemnts_at_scheduled_time:
        if appointment._assign == agent_email:
            return False
    return True