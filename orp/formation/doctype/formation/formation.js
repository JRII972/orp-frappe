// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

function prettyRow(frm){
    for (const row of frm.doc.liste_stagiaire){
        console.log(row.status)
        d = document.querySelector('div[data-name="'+ row.name + '"]')
        t = d.querySelector('div[data-fieldname="status"]')
        t.style.fontWeight = 'bold'
        switch (row.status) {
            case 'A régularisé':
              d.style.backgroundColor = 'var(--alert-bg-warning)' 
              break;
            case 'Attente de devis':
            case 'Attente de facturation':
              d.style.backgroundColor = 'var(--alert-bg-danger)' 
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            case 'Inscription complète':
              d.style.backgroundColor = 'var(--alert-bg-warning)' 
              t.style.color = 'red'
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            default:
              d.style.backgroundColor = ''
          }
            
    }
}

frappe.ui.form.on("Formation", {
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
    onload_post_render(frm) {
        prettyRow(frm)
    },
    after_save(frm){
        prettyRow(frm)
    },
    refresh(frm){
        prettyRow(frm)
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
