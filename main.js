function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

function updateStrike(cardIndex,j) {
	var id = 'deck'+cardIndex+'card'+j;
	var strikeName = 'strike-'+cardIndex+'-'+j;
	if ($('#'+id).attr('checked') == 'checked') {
		eraseCookie(strikeName);
	} else {
		createCookie(strikeName, '1', 100);
	}
}

var deckCheckboxes = [];

var cardsUsed;
var cardsLeft;
	
function pickRandom() {
	var i = parseInt(Math.random() * cardsLeft.length);
	var card = cardsLeft.splice(i, 1)[0];
	cardsUsed.push(card);
	updateHandCookies();
	return card;
}

function cardComparator(a,b) {
	var ai = decks.indexOf(a.deck);
	var bi = decks.indexOf(b.deck);
	if (ai < bi) return -1;
	if (ai > bi) return 1;
	if (a.name < b.name) return -1;
	if (a.name > b.name) return 1;
	return 0;
}

function updateHandCookies() {
	createCookie('hand-count', cardsUsed.length);
	$.each(cardsUsed, function(i,card) {
		//get the card's index of the deck and the card's index in the deck
		var deckIndex = decks.indexOf(card.deck);
		var cardIndex = card.deck.cards.indexOf(card);
		createCookie('hand-'+i, deckIndex+'-'+cardIndex);
	});
}

function buildCardsFromDecks() {
	$('#showresultsbutton').css('display', 'block');
	var allCards = [];
	$.each(decks, function(i,deck) {
		if (deckCheckboxes[i].attr('checked') == 'checked') {
			$.each(deck.cards, function(j,card) {
				if ($('#deck'+i+'card'+j).attr('checked') == 'checked') {
					allCards.push(card);
				}
			});
		}
	});
	
	cardsLeft = allCards.slice(0);
	cardsUsed = [];
	//hand-cookies init calls this, so don't update hand cookies here just yet ...
	//instead do it from any other calling functions (other than hand-cookies init)
}

function go() {
	var oneIsChecked = false;
	$.each(decks, function(i,deck) {
		if (deckCheckboxes[i].attr('checked') == 'checked') {
			oneIsChecked = true;
		}
	});
	if (!oneIsChecked) {
		alert("please select some decks");
		return;
	}
	
	buildCardsFromDecks();
	updateHandCookies();

	var count = parseInt($('#count').val());
	while (cardsUsed.length < count && cardsLeft.length > 0) {
		pickRandom();
	}

	$.mobile.changePage('#resultspage');
	fadeCard = undefined;
	redraw();
}

var fadeCard;
function redraw() {
	cardsUsed.sort(cardComparator);
	updateHandCookies();
	
	var content = $('#resultscontent');
	content.empty();

	var lastDeck = undefined;
	$.each(cardsUsed, function(i,card) {
		if (card.deck !== lastDeck) {
			lastDeck = card.deck;
			
			//dynamic list dividers and headers not working...
			/*var a = $('<a>', {
				href:'#',
				text:card.deck.name
			}).buttonMarkup({theme:'b'})
				.appendTo(content);
			*/

			var div = $('<div>').css('text-align', 'center').addClass('ui-bar, ui-bar-b').appendTo(content);
			$('<h2>').text(card.deck.name).appendTo(div);
		}
	
		var div = $('<div>').attr('data-role', 'header').addClass('ui-bar').appendTo(content);
		if (card == fadeCard) {
			div.fadeTo(0,0);
		}

		var a = $('<a>', {
			href:'#',
			text:'Strike',
			css:{cssFloat:'left'},
			click:function() {
				var deckIndex = decks.indexOf(card.deck);
				var cardIndex = card.deck.cards.indexOf(card);
				var id = 'deck'+deckIndex+'card'+cardIndex;
				$('#'+id).attr('checked', false).checkboxradio().checkboxradio('refresh');
				updateStrike(deckIndex,cardIndex);
				cardsUsed.splice(i,1);
				updateHandCookies();
				redraw();
			}
		}).attr('data-role', 'button')
			.attr('data-inline', 'true')
			.button()
			.appendTo(div);

		var a = $('<a>', {
			href:'#',
			text:'Veto',
			css:{cssFloat:'left'},
			click:function() {
				cardsUsed.splice(i,1);
				updateHandCookies();
				div.fadeTo(300, 0, function() {
					redraw();
				});
			}
		}).attr('data-role', 'button')
			.attr('data-inline', 'true')
			.button()
			.appendTo(div);
	
		var a = $('<a>', {
			href:'#',
			text:'Reroll',
			css:{cssFloat:'left'},
			click:function() {
				cardsLeft.push(cardsUsed.splice(i,1)[0]);
				updateHandCookies();
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
	
	var a = $('<a>', {
		href:'#',
		text:'Roll Again',
		click:function() {
			go();
		}
	}).attr('data-role', 'button').button().appendTo(content);
	
	var a = $('<a>', {
		href:'#',
		text:'Add Card',
		click:function() {
			fadeCard = pickRandom();
			redraw();
		}
	}).attr('data-role', 'button').button().appendTo(content);
	
	var a = $('<a>', {
		href:'#',
		text:'Strike All',
		click:function() {
			$.each(cardsUsed, function(i,card) {
				var deckIndex = decks.indexOf(card.deck);
				var cardIndex = card.deck.cards.indexOf(card);
				var id = 'deck'+deckIndex+'card'+cardIndex;
				$('#'+id).attr('checked', false).checkboxradio().checkboxradio('refresh');
				updateStrike(deckIndex, cardIndex);
			});
			go();
		}
	}).attr('data-role', 'button').button().appendTo(content);
	
	var a = $('<a>', {
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
	updateHandCookies();
	$.each(decks, function(deckIndex, deck) {
		$.each(deck.cards, function(cardIndex, card) {
			var id = 'deck'+deckIndex+'card'+cardIndex;
			$('#'+id).attr('checked', 'checked').checkboxradio().checkboxradio('refresh');
			updateStrike(deckIndex, cardIndex);
		});
	});
	$('#count').val('10');
}

function init() {
	(function(){
		var helpback = 'deckpage';
		var helpbacks = ['deckpage', 'resultspage'];
		$.each(['#deck-help', '#results-help'], function(i,id) {
			var _back = helpbacks[i];
			$(id).click(function() {
				$.mobile.changePage('#helppage');
				helpback = _back;
			});
		});
		$('#help-back').click(function() {
			$.mobile.changePage('#'+helpback);
		});
	})();

	var deckgrid = $('#deckgrid');

	var initialized = readCookie('initialized');
	createCookie('initialized', '1');

	$('#count')
		.on('input', function() {
			createCookie('count', $('#count').val());
		});
	var count = readCookie('count');
	if (count != null) {
		$('#count').val(count);
	}

	$.each(decks, function(i,deck) {
		deck.cards.sort(cardComparator);
		
		$.each(deck.cards, function(j,card) {
			card.deck = deck;
		});
	});

	$.each(decks, function(i,deck) {
		//page

		var page = $('<div>', {id:'deck'+i})
			.attr('data-role', 'page')
			.appendTo(document.body);
	
		var header = $('<div>').attr('data-role', 'header').appendTo(page);
		$('<h1>', {text:deck.name}).appendTo(header);
		
		var content = $('<div>').attr('data-role', 'content').appendTo(page);

		var a = $('<a>', {
			href:'#',
			text:'Check All',
			click:function() {
				$.each(deck.cards, function(j,card) {
					$('#deck'+i+'card'+j).attr('checked', 'checked').checkboxradio('refresh');
					updateStrike(i,j);
				});
			}
		}).attr('data-role', 'button').button().appendTo(content);
		
		
		$.each(deck.cards, function(j,card) {
			var fieldcontain = $('<div>').attr('data-role', 'fieldcontain').appendTo(content);
			var controlgroup = $('<div>').attr('data-role', 'controlgroup').appendTo(fieldcontain);
			var id = 'deck'+i+'card'+j;
			var strikeName = 'strike-'+i+'-'+j;
			var args = {
				id:id,
				type:'checkbox',
				change:function() { updateStrike(i,j); }
			};
			if (readCookie(strikeName) === null) args.checked = 'checked'; 
			var input = $('<input>', args).appendTo(controlgroup);
			var label = $('<label>', {text:card.name}).attr('for', id).appendTo(controlgroup);
		});

		$('<a>', {
			href:'#',
			text:'Done',
			click:function() {
				$.mobile.changePage('#deckpage');
			}
		}).attr('data-role', 'button').button().appendTo(content);

		//list
	
		var grid = $('<div>').addClass('ui-grid-a').appendTo(deckgrid);

		var blocka = $('<div>').addClass('ui-block-a').appendTo(grid);
		
		var fieldcontain = $('<div>')
			.attr('data-role', 'fieldcontain')
			.appendTo(blocka);

		var controlgroup = $('<div>')
			.attr('data-role', 'controlgroup')
			.appendTo(fieldcontain);
	
		var args = {
			id:'deck'+i,
			type:'checkbox',
			change:function() {
				if ($('#deck'+i).attr('checked') == 'checked') {
					createCookie('deck-'+i, '1');
				} else {
					eraseCookie('deck-'+i);
				}
			}
		};
		if (readCookie('deck-'+i) != null) args.checked = 'checked'
		if (!initialized && i == 0) {
			args.checked = 'checked';
			createCookie('deck-0', '1');
		}
		var input = $('<input>', args).appendTo(controlgroup);
		
	
		deckCheckboxes.push(input);
		var label = $('<label>', {text:deck.name})
			.attr('for', 'deck'+i)
			.appendTo(controlgroup);
		input.checkboxradio();
		input.checkboxradio('refresh');
		
		var blockb = $('<div>').addClass('ui-block-b').appendTo(grid);

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
	var handCount = readCookie('hand-count');
	if (handCount != null) {
		buildCardsFromDecks();
		handCount = parseInt(handCount);
		for (var i = 0; i < handCount; i++) {
			var hand = readCookie('hand-'+i);
			var split = hand.indexOf('-');
			var deckIndex = parseInt(hand.substring(0, split));
			var cardIndex = parseInt(hand.substring(split+1));
			//add this card to your hand
			var index;
			for (index = 0; index < cardsLeft.length; index++) {
				var card = cardsLeft[index];
				if (card == decks[deckIndex].cards[cardIndex]) {
					cardsUsed.push(cardsLeft.splice(index, 1)[0]);
					index = undefined;
					break;
				}
			}
			//how could this happen?  if the user had a hand from another deck and then unchecks the deck ...
			if (index !== undefined) console.warn("failed to find prior card");
		}
		updateHandCookies();	//incase a card wasn't found
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
	var src = $('#rollSides'+id);
	var dst = $('#rollResult'+id);
	var howmany = parseInt(src.val());
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

