const faker = require('faker');
const uniqid = require('uniqid');
const fs = require('fs');

faker.locale = "ru";
const count = 20;

const cards = [];
for (let i = 0; i < count; i++) {
	let card = {
		id: uniqid(),
		fullName: faker.name.findName(),
		phone: faker.phone.phoneNumber('+7 (###) ###-####'),
		address: [
			faker.address.zipCode(), 
			faker.address.city(), 
			faker.address.streetName(),
		].join(', '),
		codeFIAS: faker.datatype.uuid(),
		date: faker.date.recent(7),
	}
	cards.push(card);
}

fs.writeFile('./data/cards.json', JSON.stringify(cards), (err) => {
	console.log('done');
});