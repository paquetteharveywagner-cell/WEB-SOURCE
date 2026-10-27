/**
 * PITBULL MEDIA - MASTER INTERACTION ENGINE
 * Handles: Device Filtering, Dynamic Pricing & Order Dispatch,
 * Interactive 5-Star Review Engine with LocalStorage, Mobile Drawer, and Modal.
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. NAVBAR SCROLL & MOBILE DRAWER
  // =========================================================================
  const navbar = document.getElementById('main-navbar');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  const toggleMobileMenu = (open) => {
    if (open) {
      mobileDrawer?.classList.add('open');
      mobileOverlay?.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileDrawer?.classList.remove('open');
      mobileOverlay?.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = mobileDrawer?.classList.contains('open');
    toggleMobileMenu(!isOpen);
  });

  mobileOverlay?.addEventListener('click', () => toggleMobileMenu(false));
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(false));
  });

  // =========================================================================
  // 2. DEVICE FILTERING SYSTEM (ANDROID, FIRESTICK, IOS, SAMSUNG, LG, ROKU...)
  // =========================================================================
  const deviceTabs = document.querySelectorAll('.device-tab-btn');
  const deviceCards = document.querySelectorAll('.device-card');

  deviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      deviceTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.getAttribute('data-device-filter');

      deviceCards.forEach(card => {
        const cardCategory = card.getAttribute('data-device-category');
        if (filterCategory === 'all' || cardCategory === filterCategory) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });

  // =========================================================================
  // 3. CONNECTIONS & PRICES DURATION SWITCHER (1M, 3M, 6M, 1Y)
  // =========================================================================
  const durationBtns = document.querySelectorAll('.duration-tab-btn');
  const durationPanels = document.querySelectorAll('.duration-panel');

  durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      durationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetDuration = btn.getAttribute('data-duration');

      durationPanels.forEach(panel => {
        if (panel.id === `duration-${targetDuration}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  // =========================================================================
  // 4. ORDER BUTTON HANDLER & ORDER MODAL (TELEGRAM EXCLUSIVE)
  // =========================================================================
  const orderModal = document.getElementById('order-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalPlanBadge = document.getElementById('modal-selected-plan');
  const modalTgBtn = document.getElementById('modal-order-tg');
  const fastServiceSelect = document.getElementById('fast-service-select');
  const fastNotesInput = document.getElementById('fast-notes-input');

  let currentSelectedPlan = '1 Year (12 Months) - TV (£100)';

  const updateTelegramOrderLink = (plan) => {
    if (!modalTgBtn) return;
    const tgMessage = `Hello Pitbull Media, I would like to order: ${plan}. Please send activation and payment details.`;
    modalTgBtn.href = `https://t.me/PitBullMedia?text=${encodeURIComponent(tgMessage)}`;
  };

  const openOrderModal = (planName, priceText) => {
    currentSelectedPlan = planName + (priceText && !planName.includes(priceText) ? ` [${priceText}]` : '');
    if (modalPlanBadge) {
      modalPlanBadge.textContent = currentSelectedPlan;
    }

    updateTelegramOrderLink(currentSelectedPlan);

    // Sync with fast dispatcher form if available
    if (fastServiceSelect) {
      for (let i = 0; i < fastServiceSelect.options.length; i++) {
        if (fastServiceSelect.options[i].text.includes(planName.split(' - ')[0])) {
          fastServiceSelect.selectedIndex = i;
          break;
        }
      }
    }

    orderModal?.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeOrderModal = () => {
    orderModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  modalCloseBtn?.addEventListener('click', closeOrderModal);
  orderModal?.addEventListener('click', (e) => {
    if (e.target === orderModal) closeOrderModal();
  });

  modalTgBtn?.addEventListener('click', () => {
    closeOrderModal();
    showToast('Redirecting to Telegram...');
  });

  // Bind all order buttons across all cards
  const allOrderBtns = document.querySelectorAll('.trigger-order-btn');
  allOrderBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const plan = btn.getAttribute('data-plan') || 'Custom TV Stream Connection';
      const price = btn.getAttribute('data-price') || '';
      openOrderModal(plan, price);
    });
  });

  // =========================================================================
  // 5. QUICK INQUIRY DISPATCHER (DIRECT TO TELEGRAM)
  // =========================================================================
  const fastTgBtn = document.getElementById('fast-send-tg');

  fastTgBtn?.addEventListener('click', () => {
    const service = fastServiceSelect?.value || 'Stream Subscription';
    const notes = fastNotesInput?.value.trim() || 'No specific device notes';
    const message = `Hello Pitbull Media!\n\nOrder Request: ${service}\nDevice / Notes: ${notes}\n\nPlease provide payment and instant activation details.`;
    window.open(`https://t.me/PitBullMedia?text=${encodeURIComponent(message)}`, '_blank');
    showToast('Opening Telegram Support...');
  });

  // =========================================================================
  // 6. INTERACTIVE 5-STAR RATING & REVIEW SUBMISSION SYSTEM
  // =========================================================================
  const starButtons = document.querySelectorAll('.star-pick-btn');
  const ratingFeedbackText = document.getElementById('star-feedback-text');
  const reviewForm = document.getElementById('customer-review-form');
  const reviewsGrid = document.getElementById('reviews-grid-container');

  let selectedRating = 5;

  const ratingLabels = {
    1: '1 Star - Needs Improvement',
    2: '2 Stars - Below Expectations',
    3: '3 Stars - Average Service',
    4: '4 Stars - Very Good Quality',
    5: '5 Stars - Outstanding & Blazing Fast!'
  };

  const updateStarDisplay = (rating) => {
    starButtons.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-value'), 10);
      if (val <= rating) {
        btn.classList.add('active');
        btn.innerHTML = '★';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '☆';
      }
    });
    if (ratingFeedbackText) {
      ratingFeedbackText.textContent = ratingLabels[rating] || '';
    }
  };

  // Initial star display
  updateStarDisplay(selectedRating);

  starButtons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(btn.getAttribute('data-value'), 10);
      starButtons.forEach(b => {
        const val = parseInt(b.getAttribute('data-value'), 10);
        if (val <= hoverVal) {
          b.classList.add('hovered');
          b.innerHTML = '★';
        } else {
          b.classList.remove('hovered');
          b.innerHTML = '☆';
        }
      });
      if (ratingFeedbackText) {
        ratingFeedbackText.textContent = ratingLabels[hoverVal] || '';
      }
    });

    btn.addEventListener('mouseleave', () => {
      starButtons.forEach(b => b.classList.remove('hovered'));
      updateStarDisplay(selectedRating);
    });

    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.getAttribute('data-value'), 10);
      updateStarDisplay(selectedRating);
    });
  });

  // Load any previously saved user reviews from localStorage
  const loadSavedReviews = () => {
    try {
      const saved = localStorage.getItem('pitbull_media_reviews');
      if (saved) {
        const reviews = JSON.parse(saved);
        reviews.forEach(r => appendReviewCard(r, false));
      }
    } catch (e) {
      console.warn('Could not load local reviews', e);
    }
  };

  const appendReviewCard = (reviewData, isNew = true) => {
    if (!reviewsGrid) return;

    const starsHtml = '★'.repeat(reviewData.rating) + '☆'.repeat(5 - reviewData.rating);
    const initial = (reviewData.name || 'C').charAt(0).toUpperCase();

    const card = document.createElement('div');
    card.className = 'review-card';
    if (isNew) {
      card.style.animation = 'fadeIn 0.6s ease';
      card.style.borderColor = 'var(--primary-red)';
    }

    card.innerHTML = `
      <div>
        <div class="review-top-row">
          <div class="review-author-info">
            <div class="review-avatar">${initial}</div>
            <div>
              <div class="review-author-name">
                ${escapeHtml(reviewData.name)}
                <svg class="verified-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div class="review-device-tag">${escapeHtml(reviewData.device)}</div>
            </div>
          </div>
          <div class="stars-row" style="font-size: 1.1rem; color: var(--accent-gold);">
            ${starsHtml}
          </div>
        </div>
        <p class="review-body-text">
          "${escapeHtml(reviewData.comment)}"
        </p>
      </div>
      <div class="review-date-footer">
        <span>Verified Active Subscriber</span>
        <span>${reviewData.date || 'Just now'}</span>
      </div>
    `;

    if (isNew) {
      reviewsGrid.prepend(card);
    } else {
      reviewsGrid.appendChild(card);
    }
  };

  reviewForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('review-author-name');
    const deviceSelect = document.getElementById('review-device-select');
    const commentInput = document.getElementById('review-comment-text');

    const name = nameInput?.value.trim();
    const device = deviceSelect?.value || 'Connected Device';
    const comment = commentInput?.value.trim();

    if (!name || !comment) {
      showToast('Please enter your name and a brief review.', true);
      return;
    }

    const newReview = {
      name: name,
      device: device,
      rating: selectedRating,
      comment: comment,
      date: 'Today'
    };

    appendReviewCard(newReview, true);

    // Save to localStorage
    try {
      const existing = JSON.parse(localStorage.getItem('pitbull_media_reviews') || '[]');
      existing.unshift(newReview);
      localStorage.setItem('pitbull_media_reviews', JSON.stringify(existing));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    // Reset Form
    reviewForm.reset();
    selectedRating = 5;
    updateStarDisplay(5);

    showToast('Thank you! Your review has been posted successfully.');
  });

  loadSavedReviews();

  // Helper escape function
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Toast Notification System
  function showToast(message, isError = false) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }

    toast.style.borderColor = isError ? 'var(--primary-red)' : 'var(--accent-green)';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${isError ? '#ff2238' : '#10b981'}" stroke-width="2.5">
        ${isError 
          ? '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
          : '<circle cx="12" cy="12" r="10"/><polyline points="16 9 10 15 8 13"/>'}
      </svg>
      <span>${message}</span>
    `;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // Load 3D Engines immediately
  initThreeJSHero();
  init3DTiltCards();

  // =========================================================================
  // 7. 3D THREE.JS WEBGL INTERACTIVE CANVAS & ROTATIONS
  // =========================================================================
  function initThreeJSHero() {
    const canvas = document.getElementById('threejs-hero-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const parent = canvas.parentElement;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(55, parent.clientWidth / parent.clientHeight, 0.1, 1000);
    camera.position.z = 28;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(parent.clientWidth, parent.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3D Geometry: Futuristic Cyber Torus Knot (Wireframe Red & Chrome Core)
    const knotGeo = new THREE.TorusKnotGeometry(7.5, 2.2, 128, 32, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0xff1e38,
      roughness: 0.2,
      metalness: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const torusKnot = new THREE.Mesh(knotGeo, knotMat);
    torusKnot.position.set(10, 0, -2);
    scene.add(torusKnot);

    // Inner Metallic Glow Sphere
    const innerGeo = new THREE.IcosahedronGeometry(4.5, 2);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff2238,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    innerSphere.position.set(10, 0, -2);
    scene.add(innerSphere);

    // Outer Chrome Tech Ring
    const ringGeo = new THREE.TorusGeometry(12.5, 0.25, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf1f5f9,
      transparent: true,
      opacity: 0.15
    });
    const techRing = new THREE.Mesh(ringGeo, ringMat);
    techRing.position.set(10, 0, -2);
    techRing.rotation.x = Math.PI / 3;
    scene.add(techRing);

    // 3D Dynamic Particle Constellation
    const particleCount = 800;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = (Math.random() - 0.5) * 60;
      positions[i + 2] = (Math.random() - 0.5) * 45;

      // Crimson and Silver particles
      if (Math.random() > 0.45) {
        colors[i] = 1.0;
        colors[i + 1] = 0.13;
        colors[i + 2] = 0.22;
      } else {
        colors[i] = 0.95;
        colors[i + 1] = 0.96;
        colors[i + 2] = 1.0;
      }
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Ambient and Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLightRed = new THREE.PointLight(0xff2238, 3, 50);
    pointLightRed.position.set(12, 8, 12);
    scene.add(pointLightRed);

    const pointLightSilver = new THREE.PointLight(0xf1f5f9, 2, 40);
    pointLightSilver.position.set(-8, -6, 8);
    scene.add(pointLightSilver);

    // Mouse Tracking for 3D Camera & Object Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('resize', () => {
      if (!canvas.parentElement) return;
      camera.aspect = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
    });

    let clock = new THREE.Clock();

    function animate3D() {
      requestAnimationFrame(animate3D);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      targetX += (mouseX * 3.5 - targetX) * 0.05;
      targetY += (mouseY * 3.5 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // 3D Rotations on multiple axes
      torusKnot.rotation.x = elapsedTime * 0.35 + mouseY * 0.4;
      torusKnot.rotation.y = elapsedTime * 0.45 + mouseX * 0.4;
      torusKnot.rotation.z = elapsedTime * 0.15;

      innerSphere.rotation.x = -elapsedTime * 0.25;
      innerSphere.rotation.y = elapsedTime * 0.35;

      techRing.rotation.z = elapsedTime * 0.12;

      particles.rotation.y = -elapsedTime * 0.05;
      particles.rotation.x = elapsedTime * 0.02;

      // Orbiting light effect
      pointLightRed.position.x = Math.sin(elapsedTime * 1.4) * 16 + 10;
      pointLightRed.position.y = Math.cos(elapsedTime * 1.4) * 10;

      renderer.render(scene, camera);
    }
    animate3D();
  }

  // =========================================================================
  // 8. 3D PHYSICS TILT & CARD ROTATIONS ENGINE
  // =========================================================================
  function init3DTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - (rect.left + width / 2);
        const mouseY = e.clientY - (rect.top + height / 2);

        // Max 14 degree tilt
        const rotateX = -(mouseY / (height / 2)) * 14;
        const rotateY = (mouseX / (width / 2)) * 14;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;

        // Specular glare reflection
        const glare = card.querySelector('.tv-glare-overlay');
        if (glare) {
          const glareX = (mouseX / (width / 2)) * 30;
          const glareY = (mouseY / (height / 2)) * 30;
          glare.style.transform = `translate(${glareX}px, ${glareY}px) rotate(-15deg)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        const glare = card.querySelector('.tv-glare-overlay');
        if (glare) {
          glare.style.transform = 'translate(0px, 0px) rotate(-15deg)';
        }
      });
    });

    // 3D Parallax on TV screen and floating badges in Hero
    const heroWrapper = document.querySelector('.hero-3d-screen-wrapper');
    const tvFrame = document.querySelector('.tv-device-frame');
    const badge1 = document.querySelector('.floating-badge-1');
    const badge2 = document.querySelector('.floating-badge-2');

    if (heroWrapper && tvFrame) {
      heroWrapper.addEventListener('mousemove', (e) => {
        const rect = heroWrapper.getBoundingClientRect();
        const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

        const rotX = -normY * 18;
        const rotY = normX * 18;

        tvFrame.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.035, 1.035, 1.035)`;

        if (badge1) {
          badge1.style.transform = `translateZ(65px) translate(${normX * 16}px, ${normY * 16}px)`;
        }
        if (badge2) {
          badge2.style.transform = `translateZ(65px) translate(${-normX * 16}px, ${-normY * 16}px)`;
        }
      });

      heroWrapper.addEventListener('mouseleave', () => {
        tvFrame.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (badge1) badge1.style.transform = 'translateZ(60px) translate(0px, 0px)';
        if (badge2) badge2.style.transform = 'translateZ(60px) translate(0px, 0px)';
      });
    }
  }

});
