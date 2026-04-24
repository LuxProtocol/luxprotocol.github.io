function switchTab(index) {
            document.querySelectorAll('.ss-tab').forEach((t, i) => t.classList.toggle('active', i === index));
            document.querySelectorAll('.ss-panel').forEach((p, i) => p.classList.toggle('active', i === index));
          }
