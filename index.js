const kapti = require('kapti') 

exports.helloPubSub = async (event, context) => {
  try {
    console.log(`Event received: ${JSON.stringify(event)}`)
    await getScheduleByUrl(event.url)
  } catch (e) {
    console.error(`Error on init function: ${e}`)
  }
}

const _extractData = async (url) => {
  try {
    const dom = '#programacao_cinema > .row';
    let $ = await kapti.getDynamicPage(url, dom)
    let text = $('.titulo-internas').text().split('(');
    let city = text[0].trim()
    let place = text[1].replace(')', '')

    let cinema = {
      cinema: 'cinesystem',
      city,
      city_normalized: _stringNormalize(city),
      place,
      place_normalized: _stringNormalize(place),
      sessions: []
    }

    cinema.sessions = $(dom).map((i, room) => {
      let titleDOM = $(room).find('.nome-cinema').text();
      let title = titleDOM.slice(0, titleDOM.length - 2)
      let censorship = titleDOM.slice(-2)
      let roomsDOM = $(room).find('.painel-salas')
      let type = $(roomsDOM).find('.painel-salas-info span').eq(0).text()
      let hours = $(roomsDOM).find('.list-inline .list-inline-item strong').map((i, el) => $(el).text()).get()
      let special = $(roomsDOM).find('.painel-salas-info span').eq(1).text() ? true : false

      return {
        title: title,
        type: type,
        censorship: censorship,
        special: special,
        hours: hours
      }
    }).get()

    return cinema
  } catch (e) {
    console.error(e)
  }
}

const getScheduleByUrl = async (url) => {
  try {
    console.log(`Starting extraction of ${url}`)
    let result = await _extractData(url)
    console.log(`Execution of ${url} finished`)
  } catch (e) {
    console.error(`Error occurs when extracting ${url}`)
  }
}

const _stringNormalize = (str) => {
  let translate = { "à":"a", "á":"a", "â":"a", "ã":"a", "ä":"a", "å":"a", "æ":"a", "ç":"c", "è":"e", "é":"e",
    "ê":"e", "ë":"e", "ì":"i", "í":"i", "î":"i", "ï":"i", "ð":"d", "ñ":"n", "ò" :"o", "ó":"o", "ô":"o", "õ":"o", "ö":"o",
    "ø":"o", "ù":"u", "ú":"u", "û":"u", "ü":"u", "ý":"y", "þ":"b", "ß" :"s", "à":"a", "á":"a", "â":"a", "ã":"a", "ä":"a",
    "å":"a", "æ":"a", "ç":"c", "è":"e", "é":"e", "ê":"e", "ë" :"e", "ì":"i", "í":"i", "î":"i", "ï":"i", "ð":"d", "ñ":"n",
    "ò":"o", "ó":"o", "ô":"o", "õ":"o", "ö":"o", "ø" :"o", "ù":"u", "ú":"u", "û":"u", "ý":"y", "ý":"y", "þ":"b", "ÿ":"y",
    "ŕ":"r", "ŕ":"r"
  },
  translate_re = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕŕ]/gim;
  return (str.replace(translate_re, function(match) {
    return translate[match];
  }).toLowerCase());
}
