# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime
from dateutil.parser import parse
from frappe.utils import add_to_date
from frappe.desk.form.assign_to import add as add_assignment, close_all_assignments
from frappe.share import add_docshare

class Cours(Document):
	def validate(self):
		self.début = parse(self.début) #.strftime("%Y-%m-%d %H-%M-%S")
		self.fin = add_to_date(self.début, seconds=self.durée)
		
		if not self.all_day :
			if self.début >= self.fin : frappe.msgprint(
					msg='Les dates de programmation du cours sont incohérentes',
					title='Date incohérente',
					raise_exception=Exception
				)
			
	def on_update(self):
		if self.planification : #TODO: move this outise to a hook
			planification = frappe.get_doc('Planification cours', self.planification)
			_list_cours = frappe.db.get_all('Cours', 
				fields=['durée'],
				filters={
					'planification': planification.name,
					'status'       : 'Fait'
				})
			_sum_durée = 0
			print(_list_cours   )
			for cours in _list_cours : _sum_durée += cours.durée or 0
			planification.dureé_effectué = _sum_durée                
			planification.nombre_de_cours_donnée = len(_list_cours)       
			planification._fait = _sum_durée / planification.durée_totale * 100
			planification.save(ignore_permissions=True)         
			programme_formation = frappe.get_doc('Programme Formation', self.programme_formation)
			programme_formation.durée_effectué += self.durée
			programme_formation.save(ignore_permissions=True)        

		# if not self._assign:
		self.assign_agent(self.formateur)
		# available_agents = _get_agents_sorted_by_asc_workload(getdate(self.scheduled_time))
		# for agent in available_agents:
		# 	if _check_agent_availability(agent, self.scheduled_time):
		# 		self.assign_agent(agent[0])
		# 	break
	  
	def assign_agent(self, agent):
		close_all_assignments
		if not frappe.has_permission(doc=self, user=agent):
			add_docshare(self.doctype, self.name, agent, flags={"ignore_share_permission": True})
		close_all_assignments(self.doctype, self.name, ignore_permissions=True)
		add_assignment({"doctype": self.doctype, "name": self.name, "assign_to": [agent]})
			
		
			
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def planification_query(doctype, txt, searchfield, start, page_len, filters):
	print("""
		SELECT t0.name AS `Name`,
			t0.titre AS `Titre`
		FROM `tabPlanification cours` AS t0
		WHERE t0.formateur = '{formateur}'
		AND t0.parent = '{programme_formation}'
	""".format(**filters))
	return frappe.db.sql("""
		SELECT t0.name AS `Name`,
			t0.titre AS `Titre`
		FROM `tabPlanification cours` AS t0
		WHERE t0.formateur = '{formateur}'
		AND t0.parent = '{programme_formation}'
	""".format(**filters), {
		'txt': "%{}%".format(txt),
		'_txt': txt.replace("%", ""),
		'start': start,
		'page_len': page_len
	})
	
@frappe.whitelist()
def planification_data(planification):
	if frappe.db.exists('Planification cours', planification) : 
		return frappe.get_doc('Planification cours', planification).as_dict()
	
	return False