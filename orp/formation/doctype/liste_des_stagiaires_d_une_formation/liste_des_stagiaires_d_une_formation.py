# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

from distutils import fancy_getopt
from signal import raise_signal
import frappe
from frappe.model.document import Document


class Listedesstagiairesduneformation(Document):
    def validate(self):
        if not self.is_complete : self.status = "A régularisé"
        elif not self.is_payed : 
            if not self.devis : 
                if self.facture : 
                    facture = frappe.get_doc('Sales Invoice', self.facture)
                    self.status = facture.status
                    # self.is_payed = True # TODO: finish this  
                    # self.status = "Payé"
                else : 
                    self.status = "Attente de facturation"
                    
            elif not self.facture : self.status = "Attente de facturation"
        elif self.is_payed : self.status = "Attente de devis"
        else : self.status = "Inscription complète"
    
