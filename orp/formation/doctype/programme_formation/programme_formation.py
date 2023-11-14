# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class ProgrammeFormation(Document):
    @frappe.whitelist()
    def add_cours(doc, cours_data, *args, **kargs):
        cours_data = cours_data.cours_data
        cours_data.update({
            'doctype': 'Cours'
        })
        print(cours_data)
        cours = frappe.new_doc(**cours_data)
        cours.insert()
        return cours.name
    
    def validate(self):
        self.liste_cours = []
        self.durée_effectué = 0
        self.durée_planifié = 0
        cours_list = frappe.db.get_all('Cours',
            filters={
                'programme_formation': self.name
            },
            fields=['name', 'titre', 'status', 'all_day', 'début', 'durée', 'objectif_du_module', 'formateur'],
            as_list = False
        )
        
        for cours in cours_list : 
            print(cours)
            self.durée_planifié += cours['durée']
            if cours['status'] == 'Fait' : self.durée_effectué  += cours['durée']
            cours['cours'] = cours['name']
            cours.pop('name')
            # self.append('liste_cours', cours)
            
            # for planif in self.planification_cours :
            #     if planif.name == cours['planification'] :
                    
                        
        self._fait = self.durée_effectué / self.durée * 100
