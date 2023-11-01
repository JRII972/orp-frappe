from frappe import _


# def get_data():
#     return {
#         "fieldname" : "vae",
#         "transactions ": [
# 			{"label": _("RDV"), "items": ["Appointment"]},
# 		],
#     }

def get_data():
    return {
        "fieldname": "vae",
        "transactions": [
            {"label": _("RDV"), "items": ["Appointment"]},
        ],
    }