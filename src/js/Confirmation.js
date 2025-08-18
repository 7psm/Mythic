const _$a = {
  0: 'DOMContentLoaded',
  1: 'submit-order', 
  2: 'screenshot-modal',
  3: 'vendor-modal',
  4: 'not-yet-btn',
  5: 'screenshot-taken-btn', 
  6: 'continue-to-vendor',
  7: 'getElementById',
  8: 'addEventListener',
  9: 'click',
  10: 'active',
  11: 'classList',
  12: 'add',
  13: 'remove',
  14: 'cart',
  15: 'propMoneyCart',
  16: 'secureCheckoutData',
  17: 'selectedShippingMethod',
  18: 'selectedPaymentMethod',
  19: 'removeItem',
  20: 'getItem',
  21: 'setItem',
  22: '.cart-count',
  23: 'textContent',
  24: 'disabled',
  25: 'Soumettre la Commande',
  26: '../HomePage.html',
  27: 'https://discord.gg/beC8cFZaXH'
};

const _$b = (x) => _$a[x];
const _$c = ['order-number', 'order-date', 'customer-name', 'contact-name', 'contact-email', 'contact-phone', 'contact-telegram'];
const _$d = ['shipping-address', 'shipping-city', 'shipping-country', 'shipping-postal', 'shipping-method', 'shipping-delivery', 'payment-method'];
const _$e = ['order-items', 'subtotal', 'shipping-cost', 'total-cost'];

document[_$b(8)](_$b(0), function() {
    // Variables d'état obfusquées
    let _$f = [false, false, false, false, '', {}]; // [isModalOpen, screenshotTaken, isSubmitting, showVendors, selectedVendor, orderData]
    
    // Éléments DOM obfusqués  
    const _$g = document[_$b(7)](_$b(1));
    const _$h = document[_$b(7)](_$b(2));
    const _$i = document[_$b(7)](_$b(3));
    const _$j = document[_$b(7)](_$b(4));
    const _$k = document[_$b(7)](_$b(5));
    const _$l = document[_$b(7)](_$b(6));
    
    // Fonction d'initialisation obfusquée
    function _$m() {
        _$n();
        if (!_$f[5].orderNumber) {
            window.location.href = './HomePage.html';
            return;
        }
        _$o();
        _$p();
        setTimeout(() => {
            if (_$g) {
                _$g[_$b(24)] = false;
                _$g[_$b(23)] = _$b(25);
            }
        }, 3000);
    }
    
    // Chargement des données obfusqué
    function _$n() {
        try {
            const _$q = new URLSearchParams(window.location.search);
            const _$r = _$q.get('order');
            const _$s = localStorage[_$b(20)](_$b(16));
            let _$t = null;
            
            if (_$s) {
                _$t = _$u(_$s);
            }
            
            const _$v = JSON.parse(localStorage[_$b(20)](_$b(14)) || '[]');
            const _$w = localStorage[_$b(20)](_$b(17)) || 'Livraison Standard';
            const _$x = localStorage[_$b(20)](_$b(18)) || 'PayPal';
            
            _$f[5] = {
                orderNumber: _$r || _$y(),
                orderDate: new Date().toISOString(),
                name: _$t?.customerInfo?.name || 'Client',
                email: _$t?.customerInfo?.email || 'Non renseigné',
                phoneNumber: _$t?.customerInfo?.phone || 'Non renseigné', 
                telegram: _$t?.customerInfo?.discord || 'Non renseigné',
                address: _$t?.shippingInfo?.address || 'Non renseigné',
                city: _$t?.shippingInfo?.city || 'Non renseigné',
                country: _$t?.shippingInfo?.country || 'Non renseigné',
                postalCode: _$t?.shippingInfo?.postalCode || 'Non renseigné',
                orderItems: _$v,
                shippingMethod: {
                    name: _$w,
                    price: _$w.includes('Express') ? 2.50 : 0,
                    delivery: _$w.includes('Express') ? '15-20min' : '6-12h'
                },
                paymentMethod: _$x
            };
        } catch (_$z) {
            _$f[5] = { orderNumber: null };
        }
    }
    
    // Déchiffrement obfusqué
    function _$u(_$aa) {
        try {
            const _$bb = decodeURIComponent(atob(_$aa));
            const _$cc = _$bb.replace('checkout_secure_key_2024', '');
            return JSON.parse(_$cc);
        } catch (_$dd) {
            return null;
        }
    }
    
    // Génération numéro de commande obfusqué
    function _$y() {
        const _$ee = Date.now().toString().slice(-8);
        return 'PM-' + _$ee;
    }
    
    // Population des données obfusquée
    function _$o() {
        _$c.forEach((_$ff, _$gg) => {
            const _$hh = document[_$b(7)](_$ff);
            if (_$hh) {
                switch (_$gg) {
                    case 0: _$hh[_$b(23)] = _$f[5].orderNumber; break;
                    case 1: _$hh[_$b(23)] = new Date(_$f[5].orderDate).toLocaleDateString('fr-FR'); break;
                    case 2: _$hh[_$b(23)] = _$f[5].name; break;
                    case 3: _$hh[_$b(23)] = _$f[5].name; break;
                    case 4: _$hh[_$b(23)] = _$f[5].email; break;
                    case 5: _$hh[_$b(23)] = _$f[5].phoneNumber; break;
                    case 6: _$hh[_$b(23)] = _$f[5].telegram; break;
                }
            }
        });
        
        _$d.forEach((_$ii, _$jj) => {
            const _$kk = document[_$b(7)](_$ii);
            if (_$kk) {
                switch (_$jj) {
                    case 0: _$kk[_$b(23)] = _$f[5].address; break;
                    case 1: _$kk[_$b(23)] = _$f[5].city; break;
                    case 2: _$kk[_$b(23)] = _$f[5].country; break;
                    case 3: _$kk[_$b(23)] = _$f[5].postalCode; break;
                    case 4: _$kk[_$b(23)] = _$f[5].shippingMethod.name; break;
                    case 5: _$kk[_$b(23)] = _$f[5].shippingMethod.delivery; break;
                    case 6: _$kk[_$b(23)] = _$f[5].paymentMethod; break;
                }
            }
        });
        
        _$ll();
        _$mm();
    }
    
    // Population articles obfusquée
    function _$ll() {
        const _$nn = document[_$b(7)](_$e[0]);
        if (!_$nn) return;
        
        _$nn.innerHTML = '';
        _$f[5].orderItems.forEach(_$oo => {
            const _$pp = _$oo.price * _$oo.quantity;
            const _$qq = document.createElement('div');
            _$qq.className = 'order-item';
            _$qq.innerHTML = `
                <div class="item-name">
                    ${_$oo.name}
                    <span>x${_$oo.quantity}</span>
                </div>
                <div class="item-price">€${_$pp.toFixed(2)}</div>
            `;
            _$nn.appendChild(_$qq);
        });
    }
    
    // Calcul totaux obfusqué
    function _$mm() {
        const _$rr = _$f[5].orderItems.reduce((_$ss, _$tt) => _$ss + (_$tt.price * _$tt.quantity), 0);
        const _$uu = _$f[5].shippingMethod.price || 0;
        const _$vv = _$rr + _$uu;
        
        const _$ww = document[_$b(7)](_$e[1]);
        const _$xx = document[_$b(7)](_$e[2]);
        const _$yy = document[_$b(7)](_$e[3]);
        
        if (_$ww) _$ww[_$b(23)] = `€${_$rr.toFixed(2)}`;
        if (_$xx) _$xx[_$b(23)] = _$uu === 0 ? 'Gratuit' : `€${_$uu.toFixed(2)}`;
        if (_$yy) _$yy[_$b(23)] = `€${_$vv.toFixed(2)}`;
    }
    
    // Configuration événements obfusquée
    function _$p() {
        if (_$g) {
            _$g[_$b(8)](_$b(9), _$zz);
        }
        if (_$j) {
            _$j[_$b(8)](_$b(9), () => {
                _$aaa(_$h);
            });
        }
        if (_$k) {
            _$k[_$b(8)](_$b(9), _$bbb);
        }
        if (_$l) {
            _$l[_$b(8)](_$b(9), _$ccc);
        }
        
        [_$h, _$i].forEach(_$ddd => {
            if (_$ddd) {
                _$ddd[_$b(8)](_$b(9), function(_$eee) {
                    if (_$eee.target === _$ddd) {
                        _$aaa(_$ddd);
                    }
                });
            }
        });
    }
    
    // Gestion clic submit obfusqué
    function _$zz() {
        if (!_$f[1]) {
            _$fff(_$h);
        } else {
            _$ggg();
        }
    }
    
    // Confirmation screenshot obfusqué
    function _$bbb() {
        _$f[1] = true;
        _$aaa(_$h);
    }
    
    // Affichage modal vendeur obfusqué
    async function _$ggg() {
        try {
            await _$hhh();
            _$fff(_$i);
        } catch (_$iii) {}
    }
    
    // Simulation envoi Discord obfusqué
    async function _$hhh() {
        return new Promise((_$jjj) => {
            setTimeout(() => {
                _$jjj(true);
            }, 1500);
        });
    }
    
    // Redirection Discord avec nettoyage panier obfusqué
    function _$ccc() {
        localStorage[_$b(19)](_$b(14));
        localStorage[_$b(19)](_$b(15));
        localStorage[_$b(19)](_$b(16));
        localStorage[_$b(19)](_$b(17));
        localStorage[_$b(19)](_$b(18));
        
        const _$kkk = document.querySelector(_$b(22));
        if (_$kkk) {
            _$kkk[_$b(23)] = '0';
        }
        
        window.open(_$b(27), '_blank');
        _$aaa(_$i);
        
        setTimeout(() => {
            alert('✅ Commande finalisée !\n\n🛒 Votre panier a été vidé.\nVous allez être redirigé vers Discord pour contacter le vendeur.\n\nMerci pour votre commande !');
            setTimeout(() => {
                window.location.href = _$b(26);
            }, 2000);
        }, 500);
    }
    
    // Ouverture modal obfusquée
    function _$fff(_$lll) {
        if (_$lll) {
            _$lll[_$b(11)][_$b(12)](_$b(10));
            _$f[0] = true;
        }
    }
    
    // Fermeture modal obfusquée
    function _$aaa(_$lll) {
        if (_$lll) {
            _$lll[_$b(11)][_$b(13)](_$b(10));
            _$f[0] = false;
        }
    }
    
    // Initialisation
    _$m();
});

// Protection anti-debug légère mais efficace
(() => {
    'use strict';
    
    // Désactiver console
    const _x = console.log;
    console.log = console.error = console.warn = console.info = console.debug = () => {};
    
    // Bloquer raccourcis clavier
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 123 || 
            (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
            (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            return false;
        }
    });
    
    // Désactiver clic droit
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    
    // Détection DevTools (moins agressive)
    let _y = false;
    setInterval(() => {
        if (window.outerHeight - window.innerHeight > 200 && !_y) {
            _y = true;
            setTimeout(() => { _y = false; }, 5000);
        }
    }, 1000);
})();