function updateStrike(cardIndex,j) {
	let id = 'deck'+cardIndex+'card'+j;
	let strikeName = 'strike-'+cardIndex+'-'+j;
	if ($('#'+id).attr('checked') == 'checked') {
		localStorage.removeItem(strikeName);
	} else {
		localStorage.setItem(strikeName, '1');
	}
}

let deckCheckboxes = [];

let cardsUsed;
let cardsLeft;
	
function pickRandom() {
	let i = parseInt(Math.random() * cardsLeft.length);
	let card = cardsLeft.splice(i, 1)[0];
	cardsUsed.push(card);
	updateHandStorage();
	return card;
}

function cardComparator(a,b) {
	let ai = decks.indexOf(a.deck);
	let bi = decks.indexOf(b.deck);
	if (ai < bi) return -1;
	if (ai > bi) return 1;
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
}

function updateHandStorage() {
	localStorage.setItem('hand-count', cardsUsed.length);
	cardsUsed.forEach((card,i) => {
		//get the card's index of the deck and the card's index in the deck
		let deckIndex = decks.indexOf(card.deck);
		let cardIndex = card.deck.cards.indexOf(card);
		localStorage.setItem('hand-'+i, deckIndex+'-'+cardIndex);
	});
}

function buildCardsFromDecks() {
	$('#showresultsbutton').css('display', 'block');
	let allCards = [];
	decks.forEach((deck,i) => {
		if (deckCheckboxes[i].attr('checked') == 'checked') {
			deck.cards.forEach((card,j) => {
				if ($('#deck'+i+'card'+j).attr('checked') == 'checked') {
					allCards.push(card);
				}
			});
		}
	});
	
	cardsLeft = allCards.slice(0);
	cardsUsed = [];
}

function go() {
	let oneIsChecked = false;
	decks.forEach((deck,i) => {
		if (deckCheckboxes[i].attr('checked') == 'checked') {
			oneIsChecked = true;
		}
	});
	if (!oneIsChecked) {
		alert("please select some decks");
		return;
	}
	
	buildCardsFromDecks();
	updateHandStorage();

	let count = parseInt($('#count').val());
	while (cardsUsed.length < count && cardsLeft.length > 0) {
		pickRandom();
	}

	$.mobile.changePage('#resultspage');
	fadeCard = undefined;
	redraw();
}

let fadeCard;
function redraw() {
	cardsUsed.sort(cardComparator);
	updateHandStorage();
	
	let content = $('#resultscontent');
	content.empty();

	let lastDeck = undefined;
	cardsUsed.forEach((card,i) => {
		if (card.deck !== lastDeck) {
			lastDeck = card.deck;
			
			//dynamic list dividers and headers not working...
			/*let a = $('<a>', {
				href:'#',
				text:card.deck.name
			}).buttonMarkup({theme:'b'})
				.appendTo(content);
			*/

			let div = $('<div>').css('text-align', 'center').addClass('ui-bar, ui-bar-b').appendTo(content);
			$('<h2>').text(card.deck.name).appendTo(div);
		}
	
		let div = $('<div>').attr('data-role', 'header').addClass('ui-bar').appendTo(content);
		if (card == fadeCard) {
			div.fadeTo(0,0);
		}

		$('<a>', {
			href:'#',
			text:'Strike',
			css:{cssFloat:'left'},
			click:function() {
				let deckIndex = decks.indexOf(card.deck);
				let cardIndex = card.deck.cards.indexOf(card);
				let id = 'deck'+deckIndex+'card'+cardIndex;
				$('#'+id).attr('checked', false).checkboxradio().checkboxradio('refresh');
				updateStrike(deckIndex,cardIndex);
				cardsUsed.splice(i,1);
				updateHandStorage();
				redraw();
			}
		}).attr('data-role', 'button')
			.attr('data-inline', 'true')
			.button()
			.appendTo(div);

		$('<a>', {
			href:'#',
			text:'Veto',
			css:{cssFloat:'left'},
			click:function() {
				cardsUsed.splice(i,1);
				updateHandStorage();
				div.fadeTo(300, 0, function() {
					redraw();
				});
			}
		}).attr('data-role', 'button')
			.attr('data-inline', 'true')
			.button()
			.appendTo(div);
	
		$('<a>', {
			href:'#',
			text:'Reroll',
			css:{cssFloat:'left'},
			click:function() {
				cardsLeft.push(cardsUsed.splice(i,1)[0]);
				updateHandStorage();
				fadeCard = pickRandom();
				redraw();
			}
		}).attr('data-role', 'button')
			.attr('data-inline', 'true')
			.button()
			.appendTo(div);

//TODO min-width all of these
		$('<span>', {text:card.name, css:{padding:'15px', display:'inline-block', minWidth:'180px', cssFloat:'left'}}).addClass('ui-bar, ui-bar-c').appendTo(div);
		$('<span>', {text:card.type, css:{padding:'15px', display:'inline-block', minWidth:'120px', cssFloat:'left'}}).addClass('ui-bar, ui-bar-c').appendTo(div);
		$('<span>', {text:card.cost, css:{padding:'15px', display:'inline-block', minWidth:'30px', cssFloat:'left'}}).addClass('ui-bar, ui-bar-c').appendTo(div);
//TODO align right
		$('<span>', {text:card.text, css:{margin:'5px'}}).appendTo(div);

		if (card == fadeCard) { div.fadeTo(300, 1); }
	});
	
	$('<a>', {
		href:'#',
		text:'Roll Again',
		click:function() {
			go();
		}
	}).attr('data-role', 'button').button().appendTo(content);
	
	$('<a>', {
		href:'#',
		text:'Add Card',
		click:function() {
			fadeCard = pickRandom();
			redraw();
		}
	}).attr('data-role', 'button').button().appendTo(content);
	
	$('<a>', {
		href:'#',
		text:'Strike All',
		click:function() {
			cardsUsed.forEach((card,i) => {
				let deckIndex = decks.indexOf(card.deck);
				let cardIndex = card.deck.cards.indexOf(card);
				let id = 'deck'+deckIndex+'card'+cardIndex;
				$('#'+id).attr('checked', false).checkboxradio().checkboxradio('refresh');
				updateStrike(deckIndex, cardIndex);
			});
			go();
		}
	}).attr('data-role', 'button').button().appendTo(content);
	
	$('<a>', {
		href:'#',
		text:'Back',
		click:function() {
			$.mobile.changePage('#deckpage');
		}
	}).attr('data-role', 'button').button().appendTo(content);

	fadeCard = undefined;
}

function reset() {
	$('#showresultsbutton').hide();
	cardsUsed = [];
	//allCards still needs to be updated ...
	updateHandStorage();
	decks.forEach((deck,deckIndex) => {
		deck.cards.forEach((card,cardIndex) => {
			let id = 'deck'+deckIndex+'card'+cardIndex;
			$('#'+id).attr('checked', 'checked').checkboxradio().checkboxradio('refresh');
			updateStrike(deckIndex, cardIndex);
		});
	});
	$('#count').val('10');
}

function init() {
	(function(){
		let helpback = 'deckpage';
		let helpbacks = ['deckpage', 'resultspage'];
		['#deck-help', '#results-help'].forEach((id,i) => {
			let _back = helpbacks[i];
			$(id).click(function() {
				$.mobile.changePage('#helppage');
				helpback = _back;
			});
		});
		$('#help-back').click(function() {
			$.mobile.changePage('#'+helpback);
		});
	})();

	let deckgrid = $('#deckgrid');

	let initialized = localStorage.getItem('initialized');
	localStorage.setItem('initialized', '1');

	$('#count')
		.on('input', function() {
			localStorage.setItem('count', $('#count').val());
		});
	let count = localStorage.getItem('count');
	if (count != null) {
		$('#count').val(count);
	}

	decks.forEach((deck,i) => {
		deck.cards.sort(cardComparator);
		
		deck.cards.forEach((card,j) => {
			card.deck = deck;
		});
	});

	decks.forEach((deck,i) => {
		//page

		let page = $('<div>', {id:'deck'+i})
			.attr('data-role', 'page')
			.appendTo(document.body);
	
		let header = $('<div>').attr('data-role', 'header').appendTo(page);
		$('<h1>', {text:deck.name}).appendTo(header);
		
		let content = $('<div>').attr('data-role', 'content').appendTo(page);

		$('<a>', {
			href:'#',
			text:'Check All',
			click:function() {
				deck.cards.forEach((card,j) => {
					$('#deck'+i+'card'+j).attr('checked', 'checked').checkboxradio('refresh');
					updateStrike(i,j);
				});
			}
		}).attr('data-role', 'button').button().appendTo(content);
		
		
		deck.cards.forEach((card,j) => {
			let fieldcontain = $('<div>').attr('data-role', 'fieldcontain').appendTo(content);
			let controlgroup = $('<div>').attr('data-role', 'controlgroup').appendTo(fieldcontain);
			let id = 'deck'+i+'card'+j;
			let strikeName = 'strike-'+i+'-'+j;
			let args = {
				id:id,
				type:'checkbox',
				change:function() { updateStrike(i,j); }
			};
			if (localStorage.getItem(strikeName) === null) args.checked = 'checked'; 
			let input = $('<input>', args).appendTo(controlgroup);
			let label = $('<label>', {text:card.name}).attr('for', id).appendTo(controlgroup);
		});

		$('<a>', {
			href:'#',
			text:'Done',
			click:function() {
				$.mobile.changePage('#deckpage');
			}
		}).attr('data-role', 'button').button().appendTo(content);

		//list
	
		let grid = $('<div>').addClass('ui-grid-a').appendTo(deckgrid);

		let blocka = $('<div>').addClass('ui-block-a').appendTo(grid);
		
		let fieldcontain = $('<div>')
			.attr('data-role', 'fieldcontain')
			.appendTo(blocka);

		let controlgroup = $('<div>')
			.attr('data-role', 'controlgroup')
			.appendTo(fieldcontain);
	
		let args = {
			id:'deck'+i,
			type:'checkbox',
			change:function() {
				if ($('#deck'+i).attr('checked') == 'checked') {
					localStorage.setItem('deck-'+i, '1');
				} else {
					localStorage.removeItem('deck-'+i);
				}
			}
		};
		if (localStorage.getItem('deck-'+i) != null) args.checked = 'checked'
		if (!initialized && i == 0) {
			args.checked = 'checked';
			localStorage.setItem('deck-0', '1');
		}
		let input = $('<input>', args).appendTo(controlgroup);
		
	
		deckCheckboxes.push(input);
		let label = $('<label>', {text:deck.name})
			.attr('for', 'deck'+i)
			.appendTo(controlgroup);
		input.checkboxradio();
		input.checkboxradio('refresh');
		
		let blockb = $('<div>').addClass('ui-block-b').appendTo(grid);

		$('<a>', {
			href:'#',
			text:'...',
			click:function() {
				$.mobile.changePage('#deck'+i);
			}
		}).attr('data-role', 'button')
			.button()
			.appendTo(blockb);
	
	});

	//if hand-count exists ...
	let handCount = localStorage.getItem('hand-count');
	if (handCount != null) {
		buildCardsFromDecks();
		handCount = parseInt(handCount);
		for (let i = 0; i < handCount; i++) {
			let hand = localStorage.getItem('hand-'+i);
			let split = hand.indexOf('-');
			let deckIndex = parseInt(hand.substring(0, split));
			let cardIndex = parseInt(hand.substring(split+1));
			//add this card to your hand
			let index;
			for (index = 0; index < cardsLeft.length; index++) {
				let card = cardsLeft[index];
				if (card == decks[deckIndex].cards[cardIndex]) {
					cardsUsed.push(cardsLeft.splice(index, 1)[0]);
					index = undefined;
					break;
				}
			}
			//how could this happen?  if the user had a hand from another deck and then unchecks the deck ...
			if (index !== undefined) console.warn("failed to find prior card");
		}
		updateHandStorage();	//incase a card wasn't found
		$.mobile.changePage('#resultspage');
		fadeCard = undefined;
		redraw();
		$('#showresultsbutton').css('display', 'block');
	}
}

function showresults() {
	$.mobile.changePage('#resultspage');
}

function roll(id) {
	let src = $('#rollSides'+id);
	let dst = $('#rollResult'+id);
	let howmany = parseInt(src.val());
	if (howmany != howmany || howmany < 1) {
		dst.val('???');
	} else {
		/* regular: */
		dst.val(Math.floor(Math.random() * howmany) + 1);
		/* random.org * /
		$.ajax({
			url:'http://www.random.org/integers/?num=1&min=1&max='+howmany+'&col=1&base=10&format=plain&rnd=new'
		}).done(function(d) {
			dst.val(parseInt(d));
		});
		*/
	}
}

$(document).ready(init);

