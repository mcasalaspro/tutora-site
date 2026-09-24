/*
 * Sorteio dos destaques da home (o carrossel do topo).
 *
 * Este arquivo vai DENTRO da página (inline), logo depois do carrossel: roda antes da primeira pintura,
 * então a pessoa já vê os cursos sorteados, sem piscar. Os cursos possíveis ficam em <template data-destaque>
 * (imagem dentro de template não carrega); o sorteio escolhe quais viram slides e em que ordem.
 *
 * - Quem nunca navegou pelo site: sorteio simples, com mais chance para os cursos com destaque_home e
 *   lançamento, variando áreas e professores.
 * - Quem já navegou: a maior parte dos slides vem dos cursos que combinam com o que a pessoa viu (mesma área,
 *   mesmo professor, cursos relacionados, resultado do "Descubra seu curso") e aparece como "Para você".
 *   O resto é sorteio, de preferência de outras áreas, para a pessoa conhecer coisas novas.
 * - O 1º slide nunca repete o da visita anterior (a não ser que haja cursos fixos em configuracoes.yaml).
 *
 * O histórico fica só no navegador da pessoa (chave "tutora-interesses"; formato em src/scripts/interesses.ts).
 * (Ao editar: não use barras de comentário dentro de textos entre aspas; a home tira os comentários deste arquivo.)
 */
(function (global) {
  'use strict';
  var CHAVE = 'tutora-interesses';
  var DIA = 24 * 60 * 60 * 1000;

  /*
   * pool: [{ slug, area, profs: [...], rel: [...], peso }], um item por curso possível
   * perfil: o que está guardado no navegador (ou null)
   * op: { quantidade, fixos: [...], personalizar, agora, aleatorio }
   * devolve: [{ slug, paraVoce }], na ordem dos slides
   */
  function escolherDestaques(pool, perfil, op) {
    var agora = op.agora || Date.now();
    var sorte = op.aleatorio || Math.random;
    var n = Math.max(1, Math.min(op.quantidade || 6, pool.length));
    var porSlug = {};
    pool.forEach(function (c) {
      porSlug[c.slug] = c;
    });
    function decai(em, meiaVidaDias) {
      return em > 0 ? Math.pow(0.5, Math.max(0, agora - em) / (meiaVidaDias * DIA)) : 0;
    }
    function maior(obj) {
      return Object.keys(obj).reduce(function (m, k) {
        return Math.max(m, obj[k]);
      }, 0);
    }

    // ── afinidade de cada curso com o que a pessoa já viu (de 0 a 1) ──
    var af = {};
    var visto = {};
    var forca = 0;
    if (op.personalizar && perfil) {
      var I = {}; // interesse direto no curso (páginas abertas, cliques em comprar e vídeo)
      var A = {}; // por área
      var R = {}; // por professor
      var L = {}; // cursos relacionados aos que a pessoa viu
      var D = {}; // resultado do "Descubra seu curso"
      var cursos = perfil.cursos || {};
      Object.keys(cursos).forEach(function (s) {
        var r = cursos[s];
        if (!porSlug[s] || !r) return;
        var v = (Math.min(r.vezes || 0, 6) + 2.5 * Math.min(r.forte || 0, 4)) * decai(r.em, 45);
        if (v >= 0.05) {
          I[s] = v;
          visto[s] = true;
          forca += v;
        }
      });
      pool.forEach(function (c) {
        var v = I[c.slug];
        if (!v) return;
        A[c.area] = (A[c.area] || 0) + v;
        c.profs.forEach(function (p) {
          R[p] = (R[p] || 0) + v;
        });
        c.rel.forEach(function (s) {
          L[s] = (L[s] || 0) + v;
        });
      });
      [
        ['areas', A],
        ['professores', R],
      ].forEach(function (par) {
        var regs = perfil[par[0]] || {};
        Object.keys(regs).forEach(function (k) {
          var r = regs[k];
          var v = r ? Math.min(r.vezes || 0, 6) * decai(r.em, 45) : 0;
          if (v >= 0.05) {
            par[1][k] = (par[1][k] || 0) + v;
            forca += v;
          }
        });
      });
      var dsc = perfil.descubra;
      if (dsc && Array.isArray(dsc.cursos)) {
        var vd = decai(dsc.em, 90);
        dsc.cursos.forEach(function (s, i) {
          if (porSlug[s] && vd > 0) D[s] = Math.max(0.3, 1 - 0.12 * i) * vd;
        });
        forca += 4 * vd;
      }
      // cada sinal conta mais quanto mais vezes aparece, mas sem passar de 1: uma página vista pesa pouco,
      // dez páginas da mesma área pesam quase o máximo. O resultado do "Descubra" (o que a pessoa disse) pesa mais.
      var sat = function (x, k) {
        return x > 0 ? 1 - Math.exp(-x / k) : 0;
      };
      pool.forEach(function (c) {
        var r = c.profs.reduce(function (m, p) {
          return Math.max(m, R[p] || 0);
        }, 0);
        af[c.slug] =
          1.6 * (D[c.slug] || 0) +
          sat(A[c.area] || 0, 3) +
          0.6 * sat(r, 3) +
          0.9 * sat(L[c.slug] || 0, 3) +
          0.4 * sat(I[c.slug] || 0, 4);
      });
      var mAf = maior(af);
      Object.keys(af).forEach(function (s) {
        af[s] = mAf > 0 ? af[s] / mAf : 0;
      });
    }
    // histórico fraco ou antigo (uma página vista há meses) não muda nada
    var personalizado = forca >= 0.5 && maior(af) > 0;

    // ── escolha ──
    var usado = {};
    var porArea = {};
    var porProf = {};
    var fixos = [];
    var pessoais = [];
    var sorteados = [];
    function total() {
      return fixos.length + pessoais.length + sorteados.length;
    }
    function cabe(c, maxArea, maxProf) {
      if (usado[c.slug] || (porArea[c.area] || 0) >= maxArea) return false;
      return c.profs.every(function (p) {
        return (porProf[p] || 0) < maxProf;
      });
    }
    function usar(c, destino) {
      usado[c.slug] = true;
      porArea[c.area] = (porArea[c.area] || 0) + 1;
      c.profs.forEach(function (p) {
        porProf[p] = (porProf[p] || 0) + 1;
      });
      destino.push(c.slug);
    }
    function sortear(lista, peso) {
      var pesos = lista.map(function (c) {
        return Math.max(0, peso(c));
      });
      var soma = pesos.reduce(function (a, b) {
        return a + b;
      }, 0);
      if (!(soma > 0)) return null;
      var x = sorte() * soma;
      for (var i = 0; i < lista.length; i++) {
        x -= pesos[i];
        if (x < 0) return lista[i];
      }
      return lista[lista.length - 1];
    }

    // 1) cursos fixos (configuracoes.yaml), na ordem
    (op.fixos || []).forEach(function (s) {
      if (porSlug[s] && !usado[s] && total() < n) usar(porSlug[s], fixos);
    });

    // 2) "Para você": sorteio entre os que combinam, mais chance para os que combinam mais.
    //    No máximo 3 da mesma área, 2 do mesmo professor e 1 que a pessoa já abriu (o resto é novidade para ela).
    if (personalizado) {
      var vagas = Math.min(n - total(), forca >= 3 ? n - 2 : Math.ceil(n / 2));
      var jaVistos = 0;
      while (pessoais.length < vagas) {
        var candidatos = pool.filter(function (c) {
          return af[c.slug] >= 0.15 && cabe(c, 3, 2) && !(visto[c.slug] && jaVistos >= 1);
        });
        // aqui vale só o interesse da pessoa (sem o peso de destaque_home), com mais chance para quem combina mais
        var c = sortear(candidatos, function (c) {
          return Math.pow(af[c.slug], 3);
        });
        if (!c) break;
        if (visto[c.slug]) jaVistos++;
        usar(c, pessoais);
      }
    }

    // 3) sorteio do resto: prefere áreas que ainda não apareceram; se faltar curso, afrouxa os limites
    var limites = personalizado
      ? [
          [3, 2],
          [4, 3],
          [99, 99],
        ]
      : [
          [2, 1],
          [3, 2],
          [99, 99],
        ];
    limites.forEach(function (lim) {
      while (total() < n) {
        var c = sortear(
          pool.filter(function (c) {
            return cabe(c, lim[0], lim[1]);
          }),
          function (c) {
            return c.peso * (porArea[c.area] ? 0.35 : 1);
          },
        );
        if (!c) break;
        usar(c, sorteados);
      }
    });

    // ordem: fixos, três "para você", uma descoberta, o resto
    var ordem = fixos.concat(pessoais.slice(0, 3), sorteados.slice(0, 1), pessoais.slice(3), sorteados.slice(1));
    var ultimo = perfil && perfil.vitrine && perfil.vitrine.primeiro;
    if (!fixos.length && ordem.length > 1 && ordem[0] === ultimo) {
      var t = ordem[0];
      ordem[0] = ordem[1];
      ordem[1] = t;
    }
    return ordem.map(function (s) {
      return { slug: s, paraVoce: pessoais.indexOf(s) >= 0 };
    });
  }

  // para os testes automáticos
  if (global && typeof global.__testeVitrine === 'function') {
    global.__testeVitrine(escolherDestaques);
    return;
  }
  if (typeof document === 'undefined') return;

  // ── monta o carrossel ──
  var secao = document.querySelector('[data-vitrine]');
  if (!secao) return;
  var modelos = [].slice.call(secao.querySelectorAll('template[data-destaque]'));
  if (!modelos.length) return;
  function lista(txt) {
    return (txt || '').split(' ').filter(Boolean);
  }
  var pool = modelos.map(function (t) {
    return {
      slug: t.getAttribute('data-slug'),
      area: t.getAttribute('data-area') || '',
      profs: lista(t.getAttribute('data-profs')),
      rel: lista(t.getAttribute('data-rel')),
      peso: Number(t.getAttribute('data-peso')) || 1,
      modelo: t,
    };
  });
  var perfil = null;
  try {
    perfil = JSON.parse(localStorage.getItem(CHAVE) || 'null');
    if (!perfil || perfil.versao !== 1) perfil = null;
  } catch (e) {
    perfil = null;
  }
  var escolha = escolherDestaques(pool, perfil, {
    quantidade: Number(secao.getAttribute('data-quantidade')) || 6,
    fixos: lista(secao.getAttribute('data-fixos')),
    personalizar: secao.getAttribute('data-personalizar') !== '0',
  });
  var modeloDe = {};
  pool.forEach(function (c) {
    modeloDe[c.slug] = c.modelo;
  });
  var pontos = secao.querySelector('[data-pontos]');
  var tempo = Number(secao.getAttribute('data-tempo')) || 8000;
  escolha.forEach(function (e, i) {
    var slide = document.importNode(modeloDe[e.slug].content.firstElementChild, true);
    var titulo = slide.getAttribute('data-titulo') || '';
    slide.setAttribute('aria-label', i + 1 + ' de ' + escolha.length + ': ' + titulo);
    if (e.paraVoce) {
      var rotulo = slide.querySelector('[data-rotulo]');
      if (rotulo && rotulo.getAttribute('data-para-voce')) rotulo.textContent = rotulo.getAttribute('data-para-voce');
    }
    if (i === 0) {
      slide.classList.add('ativo');
      var img = slide.querySelector('.fundo-img img');
      if (img) {
        img.setAttribute('loading', 'eager');
        img.setAttribute('fetchpriority', 'high');
      }
    }
    secao.insertBefore(slide, pontos);
    if (pontos && escolha.length > 1) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'vitrine__ponto' + (i === 0 ? ' ativo' : '');
      b.setAttribute('aria-label', 'Mostrar ' + titulo);
      if (i === 0) b.setAttribute('aria-current', 'true');
      b.setAttribute('data-ponto', String(i));
      b.style.setProperty('--tempo', tempo + 'ms');
      pontos.appendChild(b);
    }
  });
  if (pontos && escolha.length < 2) pontos.parentNode.removeChild(pontos);
  modelos.forEach(function (t) {
    t.parentNode.removeChild(t);
  });
  var semJs = secao.querySelector('noscript');
  if (semJs) semJs.parentNode.removeChild(semJs);
  secao.setAttribute('data-sorteado', escolha.map(function (e) { return e.slug; }).join(' '));

  // guarda o 1º slide desta visita, para a próxima começar por outro
  try {
    var p = perfil || { versao: 1, cursos: {}, areas: {}, professores: {} };
    p.vitrine = { primeiro: escolha[0].slug, em: Date.now() };
    localStorage.setItem(CHAVE, JSON.stringify(p));
  } catch (e) {
    /* navegador sem armazenamento: segue sem guardar */
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
