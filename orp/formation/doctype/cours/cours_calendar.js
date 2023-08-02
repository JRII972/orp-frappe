frappe.views.calendar['Cours'] = {
    field_map: {
        start: 'd\u00e9but',
        end: 'fin',
        id: 'name',
        allDay: 'all_day',
        title: 'titre',
        status: 'status',
        color: 'color'
    },
    style_map: {
        Public: 'Programmer',
        Private: 'Fait'
    },
    order_by: 'fin',
    // get_events_method: 'frappe.desk.doctype.event.event.get_events'
}

// Programmer
// Fait
// Déplacer
// Annulé