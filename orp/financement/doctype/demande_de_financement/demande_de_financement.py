# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import random_string


class Demandedefinancement(Document):
    def before_save(self):
        if self.is_new() : self.demande_de_financement = self.modified
  
    def on_change(self):
        if not self.id_financement : self.id_financement = "FNC{:03d}".format(len(frappe.db.get_list(self.doctype)))
        if not self.article :
            if not frappe.db.exists('Item Attribute', "Financement ID") :
                attribut = frappe.new_doc('Item Attribute')
                attribut.attribute_name = 'Financement ID'
                attribut.insert(
                    ignore_permissions=True,
                    ignore_if_duplicate=True
                )   
            else : attribut = frappe.get_doc('Item Attribute', "Financement ID")
            
            if not frappe.db.exists('Item Attribute Value', {
                    'attribute_value' : self.name,
                    'abbr'            : self.id_financement
                }) : 
                
                attribut.append('item_attribute_values',{
                    'attribute_value' : self.name,
                    'abbr'            : self.id_financement
                })
                print("Value added !! ------------------------------")
                attribut.save(ignore_permissions=True)
                frappe.db.commit()
            
            if not frappe.db.exists('Item Group', "Financement") :
                item_group = frappe.new_doc('Item Group')
                item_group.item_group_name = "Financement"
                item_group.insert(
                    ignore_permissions=True,
                    ignore_if_duplicate=True
                )   
            else : item_group = frappe.get_doc('Item Group', "Financement")
            
            if not frappe.db.exists('Item', 'Financement') : 
                frappe.throw('Crée l\'article Financement avec variante') #TODO: fix that
            
            item_parent = frappe.get_doc('Item', 'Financement')             
            
            item = frappe.get_doc({
                'doctype': 'Item',
                'item_code' : self.id_financement,
                'variant_of': item_parent.name,
                'item_name' : f'Financement-{self.financeur} | {self.id_financement}',
                'item_group' : item_group.name,
                'stock_uom' : item_parent.stock_uom,
                'description' : f"""
                Financement de {self.source_cible} - {self.cible} </br>
                Demandeur : {self.demandeur} </br>
                Financeur : {self.financeur}
                """                
            })
            
            item.append('attributes', {
                'variant_of' : item_parent.name,
                'attribute' : attribut.name,
                'attribute_value' : self.name
            })
            
            item.save(ignore_permissions=True)
            
            self.article = item.name
            
            self.save()
