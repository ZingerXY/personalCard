
const {API_KEY} = require('./config');
const express = require('express');
const bodyParser = require('body-parser');
const Handlebars = require('express-handlebars')
const Dadata = require('dadata-suggestions');
const fs = require('fs');
const uniqid = require('uniqid');
const dadata = new Dadata(API_KEY);

class Application {
	constructor() {
		this.expressApp = express();
		this.attachRoutes();
	}

	attachRoutes() {
		let app = this.expressApp;
		app.use(express.static('public'));
		app.engine(
			'hbs',
			Handlebars.engine({
				extname: "hbs",
				defaultLayout: "",
				layoutsDir: "",
			})
		);
		app.set('views', './views')
		app.set('view engine', 'hbs')
		let jsonParser = bodyParser.json();

		app.get('/', this.root.bind(this));
		app.get('/create', this.create.bind(this));
		app.get('/cards', this.getCards.bind(this));

		app.post('/address', jsonParser, this.checkAddress.bind(this));
		app.post('/search', jsonParser, this.searchCard.bind(this));
		app.post('/addcard', jsonParser, this.addCard.bind(this));
		app.post('/delete', jsonParser, this.deleteCard.bind(this));
	}

	/**
	 * Возвращает страницу поиска карточек
	 * @param {*} req 
	 * @param {*} res 
	 */
	root(req, res) {
		if (!req.query.id) {
			res.render('index');
			return;
		}

		fs.readFile('./data/cards.json', 'utf8', (err, data) => {
			const cards = JSON.parse(data);
			let card = cards.find((e) =>
				e.id == req.query.id
			);

			if (!card) {
				res.render('index');
				return;
			} 

			card.date = new Date(card.date).toLocaleDateString();
			let params = {
				isActive: card ? true : false,
				card
			};
			console.log(params);
			res.render('index', params);
		});
	}

	/**
	 * Возвращает страницу создания карточек
	 * @param {*} req 
	 * @param {*} res 
	 */
	create(req, res) {
		res.render('create');
	}

	/**
	 * Добавляет карточку
	 * @param {*} req 
	 * @param {*} res 
	 */
	addCard(req, res) {
		fs.readFile('./data/cards.json', 'utf8', (err, data) => {
			const cards = JSON.parse(data);
			const cardId = uniqid();

			const item = {
				id: cardId,
				...req.body,
				date: new Date()
			};

			cards.push(item);

			fs.writeFile('./data/cards.json', JSON.stringify(cards), (err) => {
				res.json({
					cardId,
					result: 'ok'
				})
			});

		});
	}

	/**
	 * Поиск карточек
	 * @param {*} req 
	 * @param {*} res 
	 */
	searchCard(req, res) {
		fs.readFile('./data/cards.json', 'utf8', (err, data) => {
			let cards = JSON.parse(data);

			cards = cards.map(e => {
				return {
					...e,
					date: new Date(e.date),
				}
			})

			if (req.body.startDate) {
				let startDate = new Date(req.body.startDate).getTime();
				cards = cards.filter((e) =>
					e.date.getTime() >= startDate
				)
			}

			if (req.body.endDate) {
				let endDate = new Date(req.body.endDate)
				endDate = endDate.setHours(endDate.getHours() + 24);
				cards = cards.filter((e) =>
					e.date.getTime() <= endDate
				)
			}

			if (req.body.partName) {
				cards = cards.filter((e) =>
					e.fullName.includes(req.body.partName)
				)
			}

			cards.sort((a, b) => b.date.getTime() - a.date.getTime());
			res.json(cards);
		});
	}

	/**
	 * Возвращает все карточки
	 * @param {*} req 
	 * @param {*} res 
	 */
	getCards(req, res) {
		fs.readFile('./data/cards.json', 'utf8', (err, data) => {
			res.json(data);
		});
	}

	/**
	 * Удаляет карточку
	 * @param {*} req 
	 * @param {*} res 
	 */
	deleteCard(req, res) {
		fs.readFile('./data/cards.json', 'utf8', (err, data) => {
			let cards = JSON.parse(data);
			let cardId = req.body.cardId;
			cards = cards.filter(e => e.id != cardId);

			fs.writeFile('./data/cards.json', JSON.stringify(cards), (err) => {
				console.log('done');
				res.json({
					result: 'ok'
				})
			});

		});
	}

	/**
	 * Верификация адреса
	 * @param {*} req 
	 * @param {*} res 
	 */
	checkAddress(req, res) {
		console.log(req.body);
		if (!req.body.address) {
			res.status(400).json({});
		} else {
			dadata.address({
					query: req.body.address,
					count: 5
				})
				.then((data) => {
					res.json(data);
				})
				.catch(console.error);
		}
	}
}

module.exports = Application;