# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document


class Demandedefinancement(Document):
	def before_save(self):
		if self.is_new() : self.demande_de_financement = self.modified
