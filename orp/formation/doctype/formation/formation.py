# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

from multiprocessing.util import is_exiting

from requests import delete
import frappe
from frappe.model.document import Document
from orp.formation.doctype.modele_de_formation import modele_de_formation as mdf
from orp.formation.doctype.programme_formation import programme_formation as module
from frappe.model.naming import _format_autoname
from frappe.query_builder import DocType
from pypika import Order

class Formation(Document):
    def before_validate(self):
        print(self.programme )
        for prgm in self.programme : 
            prgm: module = frappe.get_doc("Programme Formation", prgm.programme) 
            prgm.formation = self.name
            prgm.is_template = False
            # meta = frappe.get_meta(prgm.doctype)
            # autoname = meta.autoname or ""
            # self.rename(_format_autoname(autoname, prgm))
            
        tmp = []
        for i in self.programme :
            for t in tmp :
                if i.programme != t.programme :
                    tmp.append(i)
                else : i.delete()
            if tmp == [] : tmp.append(i)
                
        self.programme = tmp
        
        if self.is_new() :
            print('init from modèle')
            self.name = None
            self.copy_from_modèle()
        for s in self.liste_stagiaire : 
            s.validate()
            print(s.status)
            
    def before_save(self):
        for s in self.liste_stagiaire : 
            # s.validate()
            print(s.status)
            
    # def on_update(self):
    #     if not self.is_new() :
    #         meta = frappe.get_meta(self.doctype)
    #         autoname = meta.autoname or ""
    #         name = _format_autoname(autoname, self)
    #         if self.name != name : self.rename(name)
    #         frappe.redirect('/app/formation/'+ self.name) # TODO:return this
            
    def copy_from_modèle(self):
        """
        Copy tasks from modèle
        """
        if self.modèle :
            modèle: mdf = frappe.get_doc('Modele de formation', self.modèle)
            self.nom = modèle.nom
            self.type = modèle.type
            self.article_de_formation = modèle.article_de_formation
            self.article_de_formation = modèle.article_de_formation
            
            self.programme = []
            for prgm in modèle.programme :
                module_tmp = frappe.get_doc(prgm.doctype, prgm) 
                module = self.create_module_from_modèle(module_tmp)
                self.programme.append(module)

    def create_module_from_modèle(self, module:module):
        prgm = frappe.get_doc("Programme Formation", module.programme) 
        module.is_template = False
        prgm.formation = self.name
        prgm.is_template = False
        prgm.name = None
        module.name = None
        return module

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def groupe_article_query(doctype, txt, searchfield, start, page_len, filters):
    GroupeArticle = DocType(doctype)
    return (
        frappe.qb.from_(GroupeArticle)
            .select(GroupeArticle.item_group_name, GroupeArticle.parent_item_group)
            .where(
                (GroupeArticle.item_group_name.like('%' + txt + '%')) &
                (GroupeArticle.parent_item_group == 'Formation')
            ).offset(start).limit(page_len)
    ).run()
    
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def article_de_formation_query(doctype, txt, searchfield, start, page_len, filters):
    if 'groupe' not in filters : filters['groupe'] = "*"
    print(filters['groupe'])
    Articles = DocType(doctype)
    
    return (
        frappe.qb.from_(Articles)
            .select(Articles.name, Articles.item_name, Articles.item_group)
            .where(
                ((Articles.item_name.like('%' + txt + '%')) | (Articles.item_name.like('%' + txt + '%'))) &
                (Articles.item_group == filters['groupe'])
            ).orderby('item_name', order=Order.desc).offset(start).limit(page_len)
    ).run()
