import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomple from './modules/autocomple';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autocomple($('#address'), $('#lat'), $('#lng'));
typeAhead($('.search'));
makeMap($('#map'));

const heartForms = $$('form.heart');

heartForms.on('submit', ajaxHeart);