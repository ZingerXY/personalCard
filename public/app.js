if (typeof Choices == 'function') {
	const address = document.querySelector('#address');

	const addressChoices = new Choices(address, {
		removeItemButton: true,
		searchPlaceholderValue: "Введите адрес",
		noResultsText: "Ничего не найдено",
	});

	addressChoices.input.element.addEventListener('input', function(e) {
		if (this.value.length < 5) {
			return;
		}
		let request = {
			address: this.value,
		}
		fetch('/address', {
				method: "POST",
				body: JSON.stringify(request),
				headers: {
					'Content-Type': 'application/json'
				},
			})
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				addressChoices.clearChoices();
				addressChoices.setChoices(data.suggestions.map(function (release) {
					return {
						value: release.unrestricted_value,
						label: release.value,
						customProperties: {
							fiasId: release.data.fias_id,
						},
					};
				}));
			});
	})

	address.addEventListener('addItem', e => {
		let fiasId = e.detail.customProperties.fiasId
		fiasField = document.querySelector('#codeFIAS');
		fiasField.value = fiasId;
	})
}

document.querySelectorAll('.inputCreate').forEach(element => {
	element.addEventListener('input', function(e) {
		checkInput(this);
	});
})

document.querySelector('.saveCard')?.addEventListener('click', e => {
	if (!checkForm()) {
		return;
	}
	saveCard(true);
});

document.querySelector('.saveCardAndProcedd')?.addEventListener('click', e => {
	if (!checkForm()) {
		return;
	}
	saveCard();
	location.reload();
});

document.querySelector('.searchButton')?.addEventListener('click', e => {
	searchCard(false)
})

/** Сохраняет карточку */
function saveCard(goView) {
	let card = {};
	document.querySelectorAll('.inputCreate').forEach(element => {
		card[element.name] = element.value;
	})
	fetch('/addcard', {
			method: "POST",
			body: JSON.stringify(card),
			headers: {
				'Content-Type': 'application/json'
			},
		})
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			// console.log(data);
			if (goView) {
				location.href = '/?id=' + data.cardId
			}
		});
}
/** Валидация поля */
function checkInput(element) {
	let label = element.closest('.fieldCreate').querySelector('.labelCreate');
	if (element.checkValidity()) {
		label.style.color = 'black';
		return true;
	} else {
		label.style.color = 'red';
		return false;
	}
}
/** Валидация полей формы */
function checkForm() {
	let isValid = true;
	document.querySelectorAll('.inputCreate').forEach(element => {
		let valid = checkInput(element);
		isValid &&= valid;
	});
	return isValid;
}
/** Поиск карточек */
function searchCard() {
	let searchFields = {}

	document.querySelectorAll('.searchField').forEach(element => {
		if (element.value) {
			searchFields[element.name] = element.value;
		}
	});

	fetch('/search', {
			method: "POST",
			body: JSON.stringify(searchFields),
			headers: {
				'Content-Type': 'application/json'
			},
		})
		.then(function (response) {
			return response.json();
		})
		.then(function (cards) {
			if (cards) {
				clearTable();
				showCards(cards);
			}
		});
}
/**
 * Выводит карточки в таблицу
 * @param {Array} cards 
 */
function showCards(cards) {
	document.querySelector('#countResult').innerText = cards.length;
	let searchResult = document.querySelector('.searchResult');
	cards.forEach(card => {
		let row = document.createElement('tr');
		row.dataset.id = card.id;
		let rowDate = new Date(card.date).toLocaleDateString();
		let rowText = '<td>' + rowDate + '</td>';
		rowText += '<td>' + card.fullName + '</td>';
		rowText += '<td>' + card.phone + '</td>';
		rowText += '<td>' + card.address + '</td>';
		row.innerHTML = rowText;
		searchResult.appendChild(row);
		let deleteCell = document.createElement('td');
		deleteCell.classList.add('deleteCell');
		row.appendChild(deleteCell);
		deleteCell.addEventListener('click', deleteCard)
	})
}
/** Очищает таблицу */
function clearTable() {
	let searchTable = document.querySelector('.searchResult');
	searchTable.querySelector('tr.searchHint').classList.add('hide');
	searchTable.querySelectorAll('tr:not(.searchHint)').forEach(element => element.remove())
}
/** Удаляет карточку */
function deleteCard() {
	let deleteRow = this.parentNode || arguments[0].parentNode;
	cardId = deleteRow.dataset.id;
	fetch('/delete', {
			method: "POST",
			body: JSON.stringify({
				cardId
			}),
			headers: {
				'Content-Type': 'application/json'
			},
		})
		.then((response) => {
			return response.json();
		})
		.then((result) => {
			// console.log(result);
			if (result.result = 'ok') {
				deleteRow.remove();
				if (!document.querySelectorAll('.searchResult tr:not(.searchHint)').length) {
					document.querySelector('tr.searchHint').classList.remove('hide');
				}
			}
		});
}