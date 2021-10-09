const methods = {
	"abc.def":true,
	"abc.fed":true,
	"abc.abc":false
};

const skipMethodCheck = {
	"abc.def":true,
};

function introspect(r) {
	return ngx.fetch("http://127.0.0.1:8083/introspect", { method:"GET"}).then((resp) => {
				if (resp.status == 401) {
					r.return(resp.status, 'unauthorized');
				}}).
			catch((err) => r.return(500, 'Internal error'))
}

const middlewares = [
	introspect,
];

function allowed(req, reject) {
	var method = req.method;
	if (methods[method]) {
		return
	}
	var a = {
		"id":req.id,
		"jsonrpc":req.jsonrpc,
		"error":{"code":-32601, "message":"Method not found"}
	};
	reject(a);
};

function checkValueOrProxy(req, reject) {
	var method = req.method;
	if (!skipMethodCheck[method]) {
		return
	}
	
	if (req.params.abc == "cba") {
		var a = {
			"id":req.id,
			"jsonrpc":req.jsonrpc,
			"error":{"code":-32601, "message":"Bad request"}
		};
		reject(a)
		}
};

const rpcRequestMiddlewares =  [
	allowed,
	checkValueOrProxy,
]

function DoRequest(parts, method, req) {
	return ngx.fetch(
		"http://127.0.0.1:8083/"+parts[0]+'/'+parts[1],
		{
			method:"POST",
			body:JSON.stringify({
				"id":req.id,
				"method":method,
				"params":req.params,
				"jsonrpc":req.jsonrpc,
			}),

		})
}

function ParseRequest(req, promises) {
	var p = new Promise((resolve, reject) => {
		rpcRequestMiddlewares.forEach((middleware) => middleware(req, reject))

		var method = req.method
		var parts = String(method).split(".");
		if (parts.length === 3) {
			method = parts[2]
		}

		DoRequest(parts, method, req).
			then((reply) => reply.text()).
			then((rr) => resolve(JSON.parse(rr))).
			catch((err) => reject(err))
	});
	promises.push(p);
}

function JSONgateway(r) {
	var resp = [];

	middlewares.forEach((middleware) => middleware(r));

	var promises = [];
	JSON.parse(r.requestText).map((req) => { ParseRequest(req, promises) });

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

export default {JSONgateway};
