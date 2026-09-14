# Ski trip 2027 planning page

Route: `/ski-trip`. Researched 14 September 2026. Dates: 28 January–1 February 2027, backup 21–25 January. Six adults, possibly eight. Four nights, doorstep or very short walk to skiing, good après. Public discussion page, no member records, RSVP or payment collection. Search engines are asked not to index it; this is not authentication.

## Evidence and limits

- French winter holidays begin 6 February: https://www.service-public.gouv.fr/particuliers/vosdroits/F31952?lang=en . Early-February weekends overlapping 6 February were removed.
- Lauzes: https://www.skiweekends.com/ski-chalets/our-ski-chalets/accommodation/avoriaz/chalet-lauzes . Four guest rooms with twin configurations, eight guests, doorstep skiing, Thursday four-night stays, shared Geneva transfers and snowcat included. No dated six/eight-person or sole-use quote obtained. £504.01 lead fare was a three-night April stay, so excluded.
- Perce Neige: https://www.skiweekends.com/ski-chalets/our-ski-chalets/accommodation/avoriaz/chalet-perce-neige . Five twin/double rooms, ten guests, Thursday four-night stays, shared Geneva transfers and snowcat. Exact quote not obtained; avoid conflating with same-named luxury chalet in Courchevel.
- Kipnuk: https://www.vip-chalets.com/chalets/chalet-kipnuk . Three twin/double rooms plus bunks, within 50m of pistes, indoor hot tub. Published 24 January weekly tariff £1,781pp, catering and scheduled Geneva coach included. No confirmed short stay; never prorate this weekly rate into a bookable four-night quote.
- MiL8: https://atlasskico.com/ski-resorts/avoriaz/hotel-mil8 . 2026/27 published B&B tariff €545 per two-person room/night, four-night minimum in 4 January–6 February band. Three rooms × four nights = €6,540; four rooms = €8,720; €1,090pp. Tourist tax extra. Availability not confirmed.
- Bellevue: https://www.bellevue-lesgets.com/hotel/formules-tarifs/ . 4 January–5 February low season Mountain room €229/night for two incl. breakfast; Superior €260. Four-night Mountain cost €458pp + €6 tourist tax; six group €2,784 incl tax; eight €3,712. Four-night acceptance and twins unconfirmed. The cheaper separate Guest House tariff is not used.
- Dromonts: https://www.sowell.fr/en/hotel-des-dromonts/ . Doorstep skiing, twin options. €214 lead offer relates to 16 December for two nights, not our dates; excluded. Dated group quote unavailable.
- Ski-area discontinuity: https://skitripedia.com/ski-towns/morzine/ . Moving from Pléney/Les Gets to Super Morzine/Avoriaz requires crossing Morzine.

## Travel research

- Current route listing: https://www.flightconnections.com/flights-from-jer-to-gva . No direct flight shown. BA via Heathrow and easyJet via Gatwick are route candidates, not verified date-specific itineraries.
- BA baggage: https://www.britishairways.com/content/information/baggage-essentials and flight connections: https://www.britishairways.com/content/information/airport-information/flight-connections . Recommend a single through booking, not separate BA tickets.
- easyJet self-connect explanation: https://flightconnections.easyjet.com/ . Reclaim/recheck baggage; cover depends on specifically booked product. Three-hour buffer is an organizer planning allowance, not a carrier guarantee.
- Date-specific searches did not expose reliable six/eight-passenger flight numbers, times, fares or seat inventory. Public search surfaced general/monthly fares and unrelated September timetable examples. These were deliberately excluded. Google links are search starting points, not price evidence. Complete live flight verification remains outstanding.
- SkiWeekends: https://www.skiweekends.com/ski-options/ski-extras/airport-transfers . Shared return included, pickup windows require matching to flights. No exact January pickup timetable verified.
- Private lead prices: https://www.snowcompare.com/destinations/france/avoriaz/geneva-to-avoriaz (£169 weekday one-way, up to 8) and https://www.snowcompare.com/destinations/france/les-gets/geneva-to-les-gets (£145 one-way). Return model doubles the lead price; it is NOT a dated return quote. Confirm capacity with luggage.
- Shared lead prices: https://alpinefleet.com/destinations/avoriaz/ (£34pp one-way) and https://alpinefleet.com/destinations/les-gets/ (£19pp one-way). Models double these per-person starting prices. Prices, stops and schedule not verified for selected dates.
- Avoriaz Welcome Centre versus Prodains is an explicit decision: https://www.avoriaz.com/en/staying/access-and-transport/prodains-cable-car/ and https://www.avoriaz.com/en/staying/access-and-transport/car-parks/ . Parking prices found include prior-season tariffs, so no dated 2027 rental/parking cost is claimed.
- Rental-sector comparison: https://www.autoeurope.co.uk/travel-blog/geneva-airport-renting-in-france-or-switzerland/ . Exact rental quote not obtained. Compare pickup sector, winter equipment, border permission, insurance, fuel/tolls/parking and luggage capacity. Rental seat count includes the driver.
- Public transport via regional rail and resort buses remains an alternative only; exact winter 2026/27 services, transfers and fares are unverified. https://www.sat-leman.com/ and https://www.altibus.com/ . Do not state daily direct Avoriaz bus availability.

## Implementation

Three additive app files only. Existing layout, public routing and per-request nonce CSP are preserved. No database migration, no changes to membership or auth. Cost calculations keep EUR and GBP separate. Flight input starts blank; entering a number does not imply provider verification. Quotes and published tariff facts should be rechecked before booking. Live deployment source verified via Railway as `jsychris/JRT_Website`, branch `railway-members-site` (service display name `JRT-website`).

## Live booking checks — 14 September 2026 (supersedes initial tariffs)

### Added: SkiWeekends Chalet Hideaway 1, Argentière / Chamonix Valley
- Official property: https://www.skiweekends.com/ski-chalets/our-ski-chalets/accommodation/argentiere/chalet-hideaway-1
- Six-adult dated offer: https://www.skiweekends.com/accommodation/argentiere/chalet-hideaway-1/6/4/1801094400/allboards/alliatas
- Eight-adult dated offer: https://www.skiweekends.com/accommodation/argentiere/chalet-hideaway-1/8/4/1801094400/allboards/alliatas
- Dates displayed: Thursday 28 January 2027, four nights (checkout Monday 1 February), classic chalet board, shared return Geneva transfers included; property states tourist tax included.
- SIX: opened room selector and selected rooms 1, 2 and 3, two adults each. Each room showed Available to book; summary £5,058 total, £843pp. The default six-person offer instead put four into room 2 and two into room 1 (only two rooms); that cheaper bunk configuration is NOT our six-person recommendation.
- EIGHT: dated search displayed eight passengers, all three rooms (4+2+2), £6,544 total / £818pp. The additional two beds are bunks in room 2. No reservation made and no identity/payment submitted.
- User supplied £330 return flights for 28 January–1 February. This is not an independently verified airline fare: airline, schedule, baggage and whole-party fare inventory unknown. Assuming £330 for each traveller: six £7,038 total / £1,173pp; eight £9,184 total / £1,148pp. These are chalet+flight subtotals, not full skiing budgets.
- Ski-in/out at foot of Grands Montets, subject to snow/open pistes; Argentière rather than central Chamonix. Three twin/double bedrooms, room 1 en suite, rooms 2/3 separate private bathrooms. Outdoor jacuzzi. No promise about future top cable-car opening. Local transport needed for other valley ski areas/central Chamonix nightlife.

### British Airways: separate exact six-adult quote
- Official public search: https://www.britishairways.com/nx/b/airselect/en/gbr/book/search/?from=JER&to=GVA&departureDate=2027-01-28&adults=6&youngAdults=0&children=0&infants=0&travelClass=economy&arrivalDate=2027-02-01&trip=round&bound=outbound
- Selected Economy Standard both ways; final flight summary £2,514.54 for six adults (£419.09pp), taxes/fees included. Expanded baggage section: one checked 23kg bag per adult each way, cabin bag and small handbag, £0 additional baggage charge for included allowance. Additional ski-bag charges not verified.
- Thu 28 Jan: BA2527 JER 09:45–LGW 10:40; BA2554 LGW 11:50–GVA 14:30. BAEuroflyer. 1h10 connection.
- Mon 1 Feb: BA737 GVA 16:25–LHR 17:10; BA1356 LHR 19:00–JER 20:10. 1h50 connection. All times local. One through return ticket; no airport change within either connection.
- Six-adult fare only; not held. Eight-person inventory and 21–25 Jan full-group fares not established. With six-person Hideaway quote: £7,572.54 / £1,262.09pp before ski costs/extras.

### Corrections to existing alternatives
- Lauzes official price calendar: no four-night offer starting 21 or 28 Jan (calendar showed dashes). Not a confirmed group option and no dated price. This is not proof of all-market sold-out status.
- Perce Neige official calendar: no four-night offer 28 Jan. Clicked 21 Jan four-night £989 lead price: returned TWO adults, £1,978 total with shared return transfers and chalet board. Six/eight not confirmed; do not multiply the two-person lead price into a claimed group quote.
- MiL8 official booking engine (https://www.hotelmil8.com/ links to https://www.secure-hotel-booking.com/smart/Hotel-MIL8/JBKM/fr/): six adults, three rooms, 28 Jan–1 Feb returned “Aucune disponibilité pour votre recherche”.
- MiL8 21–25 Jan, six adults/three rooms: individual Junior Suites €2,820 for four nights B&B + €20.80 tourist tax per room, only two left; Family Room €3,060 + tax. Complete three-room basket not finished; no group quote claimed. Earlier €545/night tariff removed from calculator because it did not reflect available inventory.
- Bellevue published €229 Mountain-room tariff retained only as clearly labelled seasonal benchmark; complete dated three/four-room booking not verified. Dromonts exact dated quote unconfirmed. Neither represented as available.
- Kipnuk removed from four-night shortlist: previous offer was weekly; four-night acceptance not verified.
- Included Hideaway airport transfers take precedence over separate transfer lead-price models; confirm operator pickup windows against actual flights. No new dated private-transfer/rental quote obtained; old lead prices remain explicitly illustrative.
