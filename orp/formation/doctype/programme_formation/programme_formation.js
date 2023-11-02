// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt
function unique(list) {
    var result = [];
    $.each(list, function(i, e) {
      if ($.inArray(e, result) == -1) result.push(e);
    });
    return result;
  }

frappe.ui.form.on("Programme Formation", {
	refresh(frm) {
        // show_notes() {
        const crm_notes = new erpnext.utils.CRMNotes({
            frm: frm,
            notes_wrapper: $(frm.fields_dict.notes_html.wrapper),
        });
        crm_notes.refresh();
    
        // show_activities() {
        const crm_activities = new erpnext.utils.CRMActivities({
            frm: frm,
            open_activities_wrapper: $(frm.fields_dict.open_activities_html.wrapper),
            all_activities_wrapper: $(frm.fields_dict.all_activities_html.wrapper),
            form_wrapper: $(frm.wrapper),
        });
        crm_activities.refresh();

        frm.add_custom_button('Nouveau cours', () => {
            let d = new frappe.ui.Dialog({
                title: 'Nouveau cours',
                fields: [
                    {
                        label: 'Sujet',
                        fieldname: 'titre',
                        fieldtype: 'Data',
                        reqd : true
                    },
                    {
                        label: 'Etat',
                        fieldname: 'etat',
                        fieldtype: 'Select',
                        options: '\nProgrammer\nFait\nDéplacer\nAnnulé',
                        default: 'Programmer', reqd : true
                    },
                    {
                        label: 'Formateur',
                        fieldname: 'formateur',
                        fieldtype: 'Link',
                        options: 'User', reqd : true
                    },
                    {
                        label: 'Planification cours',
                        fieldname: 'planification',
                        fieldtype: 'Link',
                        options: 'Planification cours', reqd : true
                    },
                    {
                        // label: 'Durée',
                        fieldname: 'column_break',
                        fieldtype: 'Column Break'
                    },
                    {
                        label: 'Début',
                        fieldname: 'début',
                        fieldtype: 'Datetime', reqd : true
                    },
                    {
                        label: 'Toute la journée ?',
                        fieldname: 'all_day',
                        fieldtype: 'Check'
                    },
                    {
                        label: 'Durée',
                        fieldname: 'durée',
                        fieldtype: 'Duration', 
                        hide_seconds: true,
                        hide_days: 1,
                        reqd : true
                    },
                    {
                        label: 'Description du module',
                        fieldname: 'description_du_module_section',
                        fieldtype: 'Section Break'
                    },
                    {
                        label: 'Objectif du module',
                        fieldname: 'objectif_du_module',
                        fieldtype: 'Text Editor'
                    },
                ],
                size: 'extra-large ', // small, large, extra-large 
                primary_action_label: 'Submit',
                primary_action(values) {
                    values["formation"] = frm.doc.formation,
                    values["programme_formation"]     = frm.doc.name
                    values["color"]     = frm.doc.color
                    frappe.call({
                        doc : cur_frm.doc,
                        method: 'add_cours',
                        args : {
                            cours_data : values
                        }
                    }).then(r => {
                        let row = frm.add_child('liste_des_cours', {
                            cours: r
                        });
                        d.hide();
                        frm.save();
                    })
                }
            });
            _list_formateur = []
            for (const row of frm.doc.planification_cours){ 
                _list_formateur.push(row.formateur)
            }
            _list_formateur = unique(_list_formateur)
            d.fields[3].get_query = () => {
                return {
                    filters: {
                        name: ['in', _list_formateur]
                    }
                }
            }
            if (_list_formateur.length == 1 ){
                d.set_value("formateur", _list_formateur[0])
            }

            _list_planification_cours = []
            for (const row of frm.doc.planification_cours){ 
                _list_planification_cours.push(row.name)
            }
            _list_planification_cours = unique(_list_planification_cours)
            d.fields[3].get_query = () => {
                return {
                    filters: {
                        name: ['in', _list_planification_cours]
                    }
                }
            }
            
            d.show();
        })
        
	},
    planification_cours(frm){

    },
    sum_course_duration(frm){
        _tot_duration = 0
        for (const row of frm.doc.planification_cours){ 
            _tot_duration += row.durée_totale || 0
        }
        frm.set_value('durée_planifié', _tot_duration)
            .then(() => {
            })
    },
    before_save(frm){
        for (const row of frm.doc.planification_cours){
            row.programme_formation = frm.doc.name
            row.titre = row.type + ' | ' + row.nbr_cours + ' x ' + row.durée / 60 / 60 + ' h' 
        }
    }
});


frappe.ui.form.on("Planification cours", {
    planification_cours_add(frm, cdt, cdn){
        let row = frappe.get_doc(cdt, cdn);
        row.programme_formation = frm.doc.name
    },
    formateur(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);
        
    },
    // durée_totale(frm, cdt, cdn){
    //     frm.trigger("sum_course_duration");
    // },
    calculate: function(frm, cdt, cdn) {
		let row = frappe.get_doc(cdt, cdn);
		frappe.model.set_value(cdt, cdn, "durée_totale", flt(row.nbr_cours) * flt(row.durée));
		frm.trigger("sum_course_duration");
	},
	nbr_cours: function(frm, cdt, cdn) {
		frm.trigger("calculate", cdt, cdn);
		frm.trigger("set_title", cdt, cdn);
	},
	durée: function(frm, cdt, cdn) {
		frm.trigger("calculate", cdt, cdn);
		frm.trigger("set_title", cdt, cdn);
	},
	type: function(frm, cdt, cdn) {
		frm.trigger("set_title", cdt, cdn);
	},
    set_title(frm, cdt, cdn){
        let row = frappe.get_doc(cdt, cdn);
        row.titre = row.type + ' | ' + row.nbr_cours + ' x ' + row.durée / 60 / 60 + ' h' 
    }
})


