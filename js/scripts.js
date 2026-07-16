// Inicializa o EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init("1B713E8Gx8FJD4r5C"); 
}

document.addEventListener("DOMContentLoaded", function() {

    // =========================================================
    // 1. Lógica do Cabeçalho Oculto ao Rolar (Corrigida)
    // =========================================================
    
    let lastScrollTop = 0;
    let isAutoScrolling = false; // Flag para impedir que o header se esconda ao clicar nos links
    const header = document.querySelector("header");
    // Obter a altura do header; usa 80px como fallback seguro
    const headerHeight = header ? header.offsetHeight : 80; 
    
    // Distância mínima (em pixels) para começar a esconder o header.
    // Isso evita que o header pisque devido ao bounce do scroll em mobile.
    const headerThreshold = headerHeight * 1.5; 

    window.addEventListener('scroll', function() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (!header) return; // Sai se o header não for encontrado

        // Se estivermos numa rolagem automática (via clique), forçamos o header a ficar visível
        if (isAutoScrolling) {
            header.style.top = "0"; 
            lastScrollTop = currentScroll;
            return;
        }

        // 1. CONDICAO DE TOPO: Se estiver no topo ou logo abaixo, mantém visível.
        if (currentScroll <= headerThreshold) {
            header.style.top = "0";
            lastScrollTop = currentScroll;
            return;
        }

        // 2. ROLAR PARA BAIXO: Esconde o header.
        // Condição: Rolar para baixo E já ter passado a zona inicial.
        if (currentScroll > lastScrollTop && currentScroll > headerThreshold) {
            header.style.top = `-${headerHeight}px`; // Move para cima fora da vista
        } 
        
        // 3. ROLAR PARA CIMA: Mostra o header.
        else if (currentScroll < lastScrollTop) {
            header.style.top = "0";
        }
        
        // Atualiza a posição anterior do scroll
        lastScrollTop = currentScroll;
    }, false);


    // =========================================================
    // 2. Lógica do Formulário (EmailJS)
    // =========================================================
    
    // O ID do formulário no HTML deve ser "contact_form"
    const form = document.getElementById("contact_form");
    
    // O botão de envio
    const submitButton = form ? form.querySelector('button[type="submit"]') : null;

    if (form && submitButton) { 
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            
            submitButton.disabled = true;
            submitButton.textContent = "Enviando...";

            const templateParams = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                phone: document.getElementById("phone").value,
                lesson_type: document.getElementById("lesson_type").value,
                message: document.getElementById("message").value
            };
            emailjs.send("service_vh00die","template_899j1ns", templateParams)
                .then(function(response) {
                    alert("Recebemos sua mensagem! Em breve entraremos em contacto.");
                    form.reset();
                    console.log('SUCESSO!', response.status, response.text);
                }, function(error) {
                    alert("Ocorreu um erro ao enviar a sua mensagem. Tente novamente mais tarde.");
                    console.log('FALHA...', error);
                })
                .finally(function() {
                    submitButton.disabled = false;
                    submitButton.textContent = "Enviar Solicitação";
                });
        });
    }

    // =========================================================
    // 3. Lógica da Rolagem Suave (CORRIGIDA)
    // =========================================================

    document.querySelectorAll('a[href*="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const targetId = href.substring(href.indexOf('#'));
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // 1. Ativa a trava
                isAutoScrolling = true; 
                if (header) header.style.top = "0"; // Garante que ele esteja visível ao iniciar

                const headerOffset = header ? header.offsetHeight : 0;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // 2. Fallback reforçado para liberar o header
                // Verificamos se o scroll parou de tempos em tempos
                let checkScroll = setInterval(() => {
                    const currentPos = window.pageYOffset || document.documentElement.scrollTop;
                    // Se chegamos perto do destino (margem de 2px), liberamos
                    if (Math.abs(currentPos - offsetPosition) < 2) {
                        isAutoScrolling = false;
                        clearInterval(checkScroll);
                    }
                }, 100);

                // Timeout de segurança (caso o scroll trave)
                setTimeout(() => {
                    isAutoScrolling = false;
                    clearInterval(checkScroll);
                }, 2000);
            }
        });
    });

    // =========================================================
    // 4. Lógica do Menu Hamburger
    // =========================================================
    const navToggle = document.querySelector('.nav-toggle');
    const body = document.body;

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            body.classList.toggle('nav-open');
        });
    }

    // Fecha o menu quando um link da navegação é clicado (útil para SPAs)
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (body.classList.contains('nav-open')) {
                body.classList.remove('nav-open');
            }
        });
    });
    // =========================================================
    // 5. Lógica para Abrir Modal de Adicionar Aula (+)
    // =========================================================
    const addModal = document.getElementById('addModal');
    const btnAddClasses = document.querySelectorAll('.btn-add-class');

    if (addModal && btnAddClasses.length > 0) {
        btnAddClasses.forEach(btn => {
            btn.addEventListener('click', function() {
                const day = this.getAttribute('data-day');
                const hour = this.getAttribute('data-hour');

                // Preenche os campos do modal
                document.getElementById('add_dia_semana').value = day;
                document.getElementById('add_hora_inicio').value = hour;
                
                // Define a hora de fim como +1h automaticamente
                let endHour = parseInt(hour.split(':')[0]) + 1;
                document.getElementById('add_hora_fim').value = (endHour < 10 ? '0' : '') + endHour + ':00';

                addModal.style.display = 'flex';
            });
        });
    }

    // =========================================================
    // 6. Lógica para Abrir Modal de Detalhes do Serviço
    // =========================================================
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceDetailModal = document.getElementById('serviceDetailModal');
    const closeServiceModalBtn = document.getElementById('closeServiceModalBtn');
    const modalServiceImage = document.getElementById('modalServiceImage');
    const modalServiceTitle = document.getElementById('modalServiceTitle');
    const modalServiceDescription = document.getElementById('modalServiceDescription');

    if (serviceCards.length > 0 && serviceDetailModal && closeServiceModalBtn) {
        serviceCards.forEach(card => {
            card.addEventListener('click', function() {
                const title = this.getAttribute('data-title') || this.querySelector('h3').textContent;
                const image = this.getAttribute('data-image');
                const description = this.querySelector('.detailed-description').innerHTML;

                if (image) {
                    modalServiceImage.src = image;
                    modalServiceImage.alt = title;
                    modalServiceImage.style.display = 'block';
                } else {
                    modalServiceImage.removeAttribute('src');
                    modalServiceImage.style.display = 'none';
                }

                modalServiceTitle.textContent = title;
                modalServiceDescription.innerHTML = description; // Usar innerHTML para manter as quebras de linha

                serviceDetailModal.style.display = 'flex'; // Exibe o modal
                document.body.classList.add('modal-open'); // Trava o scroll
            });
        });

        const closeModalAction = () => {
            serviceDetailModal.style.display = 'none'; // Esconde o modal
            document.body.classList.remove('modal-open'); // Libera o scroll
        };

        closeServiceModalBtn.addEventListener('click', closeModalAction);

        const modalContactBtn = document.getElementById('modalContactBtn');
        if (modalContactBtn) {
            modalContactBtn.addEventListener('click', closeModalAction);
        }

        // Fechar ao clicar no fundo (fora da caixa branca)
        serviceDetailModal.addEventListener('click', (event) => {
            if (event.target === serviceDetailModal) {
                closeModalAction();
            }
        });
    }

    // =========================================================
    // 7. Lógica para Fechar Outros Modais (Resultados)
    // =========================================================
    const closeModalResults = document.querySelector('#resultsModal .close-modal');
    const resultsModal = document.getElementById('resultsModal');

    if (resultsModal) {
        if (closeModalResults) {
            closeModalResults.addEventListener('click', () => {
                resultsModal.style.display = 'none';
                document.body.classList.remove('modal-open');
                window.location.href = 'torneios.php';
            });
        }

        // Fechar ao clicar no fundo
        resultsModal.addEventListener('click', (event) => {
            if (event.target === resultsModal) {
                resultsModal.style.display = 'none';
                document.body.classList.remove('modal-open');
                window.location.href = 'torneios.php';
            }
        });
    }
});

// =========================================================
// 8. Script para atualizar automaticamente Pontos e Jogos
// =========================================================
const inputVitorias = document.getElementById('vitorias');
const inputDerrotas = document.getElementById('derrotas');
const inputJogos = document.getElementById('jogos');
const inputPontos = document.getElementById('pontos');

function atualizarTotais() {
    const v = parseInt(inputVitorias?.value) || 0;
    const d = parseInt(inputDerrotas?.value) || 0;
    if(inputJogos) inputJogos.value = v + d;
    if(inputPontos) inputPontos.value = v - d;
}

if(inputVitorias && inputDerrotas) {
    inputVitorias.addEventListener('input', atualizarTotais);
    inputDerrotas.addEventListener('input', atualizarTotais);
}