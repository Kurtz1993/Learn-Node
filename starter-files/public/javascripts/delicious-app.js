import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import autocomple from './modules/autocomple';

autocomple($('#address'), $('#lat'), $('#lng'));