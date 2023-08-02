// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

frappe.ui.form.on("Cours", {
	refresh(frm) {

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
    }
});
