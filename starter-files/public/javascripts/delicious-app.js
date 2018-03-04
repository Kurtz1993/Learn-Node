import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomple from './modules/autocomple';
import typeAhead from './modules/typeAhead';

autocomple($('#address'), $('#lat'), $('#lng'));
typeAhead($('.search'));