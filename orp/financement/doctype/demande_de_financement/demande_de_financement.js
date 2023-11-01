// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

frappe.ui.form.on("Demande de financement", {
	refresh(frm) {
        frm.add_custom_button('Brouillon', () => {
            frm.set_value('status', 'Brouillon')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('En attente d\'envoie', () => {
            frm.set_value('status', 'En attente d\'envoie')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('En attente de validation', () => {
            frm.set_value('status', 'En attente de validation')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('Navette', () => {
            frm.set_value('status', 'Navette')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('Validé', () => {
            frm.set_value('status', 'Validé')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('En attente de paiement', () => {
            frm.set_value('status', 'En attente de paiement')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('Partiellement payé', () => {
            frm.set_value('status', 'Partiellement payé')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('Payé', () => {
            frm.set_value('status', 'Payé')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));

        frm.add_custom_button('En attente', () => {
            frm.set_value('status', 'En attente')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('Refusé', () => {
            frm.set_value('status', 'Refusé')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));
        frm.add_custom_button('Annulé', () => {
            frm.set_value('status', 'Annulé')
                .then(() => {
                    frm.save()
            })
        }, __('Changer le statut'));

        frm.set_query('source_cible', () => {
            return {
                filters: {
                    name: ['in', ['VAE', 'Formation']]
                }
            }
        })

        // Set indicator
        // switch (frm.doc.status) {
        //     case 'En attente d\'envoie':
        //         frm.page.set_indicator('En attente d\'envoie', 'red')
        //         break
        //     case 'En attente de validation':
        //         frm.page.set_indicator('En attente de validation', 'purple')
        //         break
        //     case 'Navette':
        //         frm.page.set_indicator('Navette', 'green')
        //         break
        //     case 'Validé':
        //         frm.page.set_indicator('Validé', 'green')
        //         break
        //     case 'En attente de paiement':
        //         frm.page.set_indicator('En attente de paiement', 'cyan')
        //         break
        //     case 'Partiellement payé':
        //         frm.page.set_indicator('Partiellement payé', 'light-blue')
        //         break
        //     case 'Payé':
        //         frm.page.set_indicator('Payé', 'blue')
        //         break
        //     case 'En attente':
        //         frm.page.set_indicator('En attente', 'darkgrey')
        //         break
        //     case 'Annulé':
        //         frm.page.set_indicator('Annulé', 'grey')
        //         break
        //     case 'Refusé':
        //         frm.page.set_indicator('Refusé', 'pink')
        //         break
        //     case 'Brouillon':
        //     default:
        //         frm.page.set_indicator('Brouillon', 'orange')
        //   }
	},
});


frappe.ui.form.on("Liste action comptable financement", {
	refresh(frm) {

	},
});
