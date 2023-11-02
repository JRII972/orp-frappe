// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cours", {
	refresh(frm) {
        if ( frm.doc.formation){
            if (frm.doc.programme_formation){
                frm.trigger("setup_planification_query")
            }
        }
        frm.trigger("update_by_planif")
	},
    onload(frm){
        frm.set_query("programme_formation", function() {
            return {
                "filters": {
                    "formation": frm.doc.formation
                }
            };
        });
    },
    validate(frm){
        if (frm.doc.all_day == false) {
            if( frm.doc.début == frm.doc.fin ){
                frappe.throw(__('Les dates sont confondues'))
            }
            if( frm.doc.début > frm.doc.fin ){
                frappe.throw(__('La date de fin est antérieur à celle du début du cours'))
            }
        }
    },
    module(frm){
        if ((frm.doc.titre == undefined) || (frm.doc.titre == '')){
            frm.doc.titre = frm.doc.module 
            frm.refresh_field('titre')
        }
        
    },
    début(frm){
        // Clean second
        d = new Date(cur_frm.doc.début)
        d.setSeconds(0)
        frm.doc.début = d.toString()
        frm.refresh_field('début')

        // Set durée
        if ((frm.doc.durée == undefined) || (frm.doc.durée == '')){
            frm.doc.durée = 7200
        }
        frm.refresh_field('durée')

        // set fin
        d = new Date(cur_frm.doc.début)
        f = new Date(cur_frm.doc.fin)
        f.setTime(frm.doc.durée*1000 + d.getTime())
        frm.doc.fin = f.toString()
        frm.refresh_field('fin')
    },
    durée(frm){
        d = new Date(cur_frm.doc.début)
        f = new Date(cur_frm.doc.fin)
        f.setTime(frm.doc.durée*1000 + d.getTime())
        frm.doc.fin = f.toString()
        frm.refresh_field('fin')
    },
    setup_planification_query(frm){
        frm.set_query("planification", function() {
            return {
                query: "orp.formation.doctype.cours.cours.planification_query",
                filters: {
                    formateur : frm.doc.formateur,
                    programme_formation : frm.doc.programme_formation
                }
            };
        });
    },
    formateur(frm){
        frm.trigger("setup_planification_query")
    },
    programme_formation(frm){
        frm.trigger("setup_planification_query")
    },
    planification(frm){
        frm.trigger("update_by_planif")
    },
    update_by_planif(frm){
        if ( ! frm.doc.planification ){
            frm.toggle_enable(['durée', 'all_day', 'type'], true);
            frm.refresh()
        } else {
             // call with all options
        frappe.call({
            method: 'orp.formation.doctype.cours.cours.planification_data',
            args: {
                planification: frm.doc.planification
            },
            freeze: true,
            callback: (r) => {
                if ( r ){
                    console.log(r.message.durée)
                    frm.set_value('durée', r.message.durée )
                    frm.set_value('all_day', r.message.all_day)
                    frm.set_value('type', r.message.type)
                    frm.refresh_fields(['durée', 'all_day', 'type'])
                    frm.toggle_enable(['durée', 'all_day', 'type'], false);
                }
            },
            error: (r) => {
                frm.refresh_fields(['durée', 'all_day', 'type'])
                frm.toggle_enable(['durée', 'all_day', 'type'], true);
                // on error
            }
        })
        }
    },
    all_day(frm){
        frm.toggle_display(['durée', 'fin'], !cur_frm.doc.all_day);
    }
});
