import {methods} from './modules/allowed_methods';

function allowed(req, reject) {
	var method = req["method"];
	if (methods[method]) {
		return
	}
	var a = {
		"id":req["id"], 
		"jsonrpc":req["jsonrpc"],
		"error":{"code":-32601, "message":"Method not found"}
	};
	reject(a);
};

function JSONgateway(r) {
	var resp = [];

	var promises = [];
	JSON.parse(r.requestText).map((req) => {

		var p = new Promise((resolve, reject) => {
			allowed(req, reject);

			var method = req["method"];
			var parts = String(method).split(".");
            if (parts.length === 3) {
                method = parts[2]
            }
			ngx.fetch(
				"http://127.0.0.1:8083/"+parts[0]+'/'+parts[1],
				{
					method:"POST",
					body:JSON.stringify({
						"id":req["id"],
						"method":method,
						"params":req["params"],
						"jsonrpc":req["jsonrpc"],
					}),

				}).
				then((reply) => reply.text()).
				then((rr) => resolve(JSON.parse(rr))).
				catch((err) => reject(err))
		});
		promises.push(p);
	});

	return Promise.allSettled(promises).
			then((results) => results.forEach((result) => {
				if (result.value === undefined) {
					resp.push(result.reason);
				} else {
					resp.push(result.value);
				}
			})).
			then((rr) => r.return(200, JSON.stringify(resp)));
};

export {JSONgateway};
