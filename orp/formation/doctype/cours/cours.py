# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import datetime
from dateutil.parser import parse

class Cours(Document):
	def validate(self):
		print(self.début)
		print(type(self.début))
		self.début = parse(self.début).tz.strftime("%Y-%m-%d %H-%M-%S")
		self.fin = parse(self.fin) # .strftime("%Y-%m-%d %H-%M-%S")
		print(self.début)
		if not self.all_day :
			if self.début >= self.fin : frappe.msgprint(
					msg='Les dates de programmation du cours sont incohérentes',
					title='Date incohérente',
					raise_exception=Exception
				)