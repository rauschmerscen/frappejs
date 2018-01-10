const frappe = require('frappe-core');

module.exports = {
	setup(app) {
		// get list
		app.get('/api/resource/:doctype', frappe.async_handler(async function(request, response) {
			let fields, filters;
			for (key of ['fields', 'filters']) {
				if (request.params[key]) {
					request.params[key] = JSON.parse(request.params[key]);
				}
			}

			let data = await frappe.db.get_all({
				doctype: request.params.doctype,
				fields: request.params.fields || ['name', 'subject'],
				filters: request.params.filters,
				start: request.params.start || 0,
				limit: request.params.limit || 20,
				order_by: request.params.order_by,
				order: request.params.order
			});

			return response.json(data);
		}));

		// create
		app.post('/api/resource/:doctype', frappe.async_handler(async function(request, response) {
			data = request.body;
			data.doctype = request.params.doctype;
			let doc = await frappe.get_doc(data);
			await doc.insert();
			await frappe.db.commit();
			return response.json(doc.get_valid_dict());
		}));

		// update
		app.put('/api/resource/:doctype/:name', frappe.async_handler(async function(request, response) {
			data = request.body;
			let doc = await frappe.get_doc(request.params.doctype, request.params.name);
			Object.assign(doc, data);
			await doc.update();
			await frappe.db.commit();
			return response.json(doc.get_valid_dict());
		}));


		// get document
		app.get('/api/resource/:doctype/:name', frappe.async_handler(async function(request, response) {
			let doc = await frappe.get_doc(request.params.doctype, request.params.name);
			return response.json(doc.get_valid_dict());
		}));

		// delete
		app.delete('/api/resource/:doctype/:name', frappe.async_handler(async function(request, response) {
			let doc = await frappe.get_doc(request.params.doctype, request.params.name)
			await doc.delete();
			return response.json({});
		}));
	}
};