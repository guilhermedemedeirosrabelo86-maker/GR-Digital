/* =========================================
   GR DIGITAL — INTERAÇÕES E ANIMAÇÕES
========================================= */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const header = document.querySelector('.container_header');
    const progressBar = document.querySelector('.scroll_progress');
    const wppFloat = document.querySelector('.wpp_float');
    const backTop = document.querySelector('.back_top');
    const processoGrid = document.querySelector('.processo_grid');

    /* ---------- Menu mobile ---------- */
    const menuToggle = document.querySelector('.menu_toggle');
    const nav = document.querySelector('.main_nav');

    const setMenu = (open) => {
        if (!menuToggle || !nav) return;
        menuToggle.setAttribute('aria-expanded', String(open));
        menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        nav.classList.toggle('is_open', open);
        document.body.classList.toggle('menu_open', open);
    };

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
        });
        nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setMenu(false);
        });
        window.matchMedia('(min-width: 981px)').addEventListener('change', (e) => {
            if (e.matches) setMenu(false);
        });
    }

    /* ---------- Rolagem: header, progresso, botões flutuantes, linha do processo ---------- */
    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        header?.classList.toggle('is_scrolled', y > 20);
        if (progressBar) progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        wppFloat?.classList.toggle('is_visible', y > 400);
        backTop?.classList.toggle('is_visible', y > 900);

        if (processoGrid) {
            const rect = processoGrid.getBoundingClientRect();
            const start = window.innerHeight * 0.85;
            const progress = Math.min(Math.max((start - rect.top) / (rect.height + start * 0.4), 0), 1);
            processoGrid.style.setProperty('--progress', progress.toFixed(3));
        }

        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    backTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    /* ---------- Revelar elementos ao rolar ---------- */
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
        group.querySelectorAll(':scope > [data-reveal]').forEach((el, i) => {
            if (!el.dataset.revealDelay) el.style.setProperty('--reveal-delay', `${i * 0.09}s`);
        });
    });

    document.querySelectorAll('[data-reveal-delay]').forEach((el) => {
        el.style.setProperty('--reveal-delay', `${Number(el.dataset.revealDelay) * 0.1}s`);
    });

    const revealEls = document.querySelectorAll('[data-reveal]');

    if ('IntersectionObserver' in window && !reduceMotion) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is_visible');
                revealObserver.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach((el) => revealObserver.observe(el));
    } else {
        revealEls.forEach((el) => el.classList.add('is_visible'));
    }

    /* ---------- Contadores ---------- */
    const counters = document.querySelectorAll('[data-count]');

    const runCounter = (el) => {
        const target = Number(el.dataset.count);
        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(target * eased);
            if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && !reduceMotion) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                runCounter(entry.target);
                counterObserver.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        counters.forEach((el) => counterObserver.observe(el));
    }

    /* ---------- Link ativo no menu ---------- */
    const navLinks = [...document.querySelectorAll('.main_nav a[href^="#"]')];
    const sections = navLinks
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    if (sections.length && 'IntersectionObserver' in window) {
        const spy = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    link.classList.toggle('is_active', link.getAttribute('href') === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        sections.forEach((section) => spy.observe(section));
    }

    /* ---------- Marquee: duplica conteúdo para loop contínuo ---------- */
    document.querySelectorAll('.marquee_track').forEach((track) => {
        [...track.children].forEach((item) => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    });

    /* ---------- FAQ (acordeão) ---------- */
    document.querySelectorAll('.faq_item').forEach((item) => {
        const button = item.querySelector('.faq_question');
        button?.addEventListener('click', () => {
            const open = !item.classList.contains('is_open');
            document.querySelectorAll('.faq_item.is_open').forEach((other) => {
                if (other === item) return;
                other.classList.remove('is_open');
                other.querySelector('.faq_question')?.setAttribute('aria-expanded', 'false');
            });
            item.classList.toggle('is_open', open);
            button.setAttribute('aria-expanded', String(open));
        });
    });

    /* ---------- Efeitos de ponteiro (apenas desktop) ---------- */
    if (finePointer && !reduceMotion) {
        // Spotlight nos cards
        document.querySelectorAll('.spotlight').forEach((card) => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                card.style.setProperty('--my', `${e.clientY - rect.top}px`);
            });
        });

        // Inclinação 3D do mockup + parallax dos badges
        const mockup = document.querySelector('.hero-mockup');
        const hero = document.querySelector('.hero');

        if (mockup && hero) {
            const badges = mockup.querySelectorAll('.mockup-badge');
            let frame = null;

            hero.addEventListener('pointermove', (e) => {
                if (frame) cancelAnimationFrame(frame);
                frame = requestAnimationFrame(() => {
                    const rect = mockup.getBoundingClientRect();
                    const x = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
                    const y = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
                    const cx = Math.max(-1, Math.min(1, x));
                    const cy = Math.max(-1, Math.min(1, y));

                    mockup.classList.add('is_tilting');
                    mockup.style.setProperty('--ry', `${cx * 10 - 4}deg`);
                    mockup.style.setProperty('--rx', `${-cy * 8 + 2}deg`);
                    mockup.style.setProperty('--gx', `${50 + cx * 40}%`);
                    mockup.style.setProperty('--gy', `${50 + cy * 40}%`);

                    badges.forEach((badge) => {
                        const depth = Number(badge.dataset.depth || 1);
                        badge.style.setProperty('--px', `${cx * depth * 10}px`);
                        badge.style.setProperty('--py', `${cy * depth * 10}px`);
                    });
                });
            });

            hero.addEventListener('pointerleave', () => {
                mockup.classList.remove('is_tilting');
                ['--ry', '--rx', '--gx', '--gy'].forEach((prop) => mockup.style.removeProperty(prop));
                badges.forEach((badge) => {
                    badge.style.removeProperty('--px');
                    badge.style.removeProperty('--py');
                });
            });
        }

        // Botões "magnéticos"
        document.querySelectorAll('.btn_principal, .wpp_float').forEach((btn) => {
            btn.addEventListener('pointermove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
                btn.style.translate = `${x}px ${y}px`;
            });
            btn.addEventListener('pointerleave', () => {
                btn.style.translate = '';
            });
        });
    }

    /* ---------- Ano atual no rodapé ---------- */
    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = new Date().getFullYear();
    });
});
