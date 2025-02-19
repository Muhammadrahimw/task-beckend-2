const express = require("express");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.use(
	cors({
		origin: "http://localhost:3000",
		methods: "GET,POST,PUT,DELETE",
		allowedHeaders: "Content-Type,Authorization",
	})
);

const dataPath = path.join(__dirname, "module", "plants.json");

let data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

const userRoleCheck = (req, res, next) => {
	if (Number(req.params.userId) === 1) {
		return next();
	}
	return res.status(403).json({message: "You don't have permission"});
};

app.get(`/:userId/flowers`, (req, res) => {
	res.send(data);
});

app.get(`/:userId/flowers/:id`, (req, res) => {
	const flower = data.find((flower) => flower.id === Number(req.params.id));
	flower ? res.send(flower) : res.status(404).json({message: `Not found`});
});

app.post(`/:userId/flowers`, userRoleCheck, (req, res) => {
	if (
		!req.body.name ||
		!req.body.family ||
		!req.body.origin ||
		!req.body.lifespan ||
		!req.body.description
	) {
		return res.json({message: `data is failed`});
	}

	data.push({id: data.length ? data.length + 1 : 1, ...req.body});
	fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
	res.status(201).json({message: `product created`, data: req.body});
});

app.put(`/:userId/flowers/:id`, userRoleCheck, (req, res) => {
	if (
		!req.body.name ||
		!req.body.family ||
		!req.body.origin ||
		!req.body.lifespan ||
		!req.body.description
	) {
		return res.json({message: `data is failed`});
	}
	data = data.map((flower) =>
		flower.id === Number(req.params.id)
			? {id: req.params.id, ...req.body}
			: flower
	);
	fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
	res.json({
		message: `product updated`,
		data: {id: Number(req.params.id), ...req.body},
	});
});

app.delete(`/:userId/flowers/:id`, userRoleCheck, (req, res) => {
	if (!req.params.id) {
		return res.json({message: "id is required"});
	}
	if (!data.find((flower) => flower.id === Number(req.params.id))) {
		return res.json({message: `flower is not defined`});
	}
	data = data.filter((flower) => flower.id !== Number(req.params.id));
	fs.writeFileSync(dataPath, JSON.stringify(data, null, 4));
	res.json({message: `flower deleted`});
});

// ----------------------------------------------------------------------------

app.listen(PORT, () => {
	console.log(`server started: http://localhost:${PORT}`);
});
