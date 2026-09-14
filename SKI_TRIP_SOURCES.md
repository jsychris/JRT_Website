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
