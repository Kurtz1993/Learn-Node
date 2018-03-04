import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomple from './modules/autocomple';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';

autocomple($('#address'), $('#lat'), $('#lng'));
typeAhead($('.search'));
makeMap($('#map'));