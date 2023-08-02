# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

# import frappe
import frappe
from frappe.model.document import Document


class Modeledeformation(Document):
	def before_validate(self):
		for prgm in self.programme : prgm.is_template = True
		