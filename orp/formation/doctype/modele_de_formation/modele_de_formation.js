// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

frappe.ui.form.on("Modele de formation", {
	refresh(frm) {

	},
    before_load(frm){
        frm.set_query('type', () => {
            return {
                query: 'orp.formation.doctype.formation.formation.groupe_article_query',
            }
        })
        frm.set_query('article_de_formation', () => {
            return {
                query: 'orp.formation.doctype.formation.formation.article_de_formation_query',
                filters: {
                    groupe: frm.doc.type
                }
            }
        })
    },
    type(frm){
        frm.set_query('article_de_formation', () => {
            return {
                query: 'orp.formation.doctype.formation.formation.article_de_formation_query',
                filters: {
                    groupe: frm.doc.type
                }
            }
        })
    },
});
