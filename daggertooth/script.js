document.addEventListener('DOMContentLoaded', () => {
  /* =========================================================
     1. 다크 모드 / 라이트 모드 전환 로직
     ========================================================= */
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeIcon = themeToggleBtn.querySelector('.theme-icon');
  const themeText = themeToggleBtn.querySelector('.theme-text');

  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'light') {
      themeIcon.textContent = '🌙';
      themeText.textContent = '다크 모드';
      themeToggleBtn.setAttribute('title', '다크 모드로 전환');
    } else {
      themeIcon.textContent = '☀️';
      themeText.textContent = '라이트 모드';
      themeToggleBtn.setAttribute('title', '라이트 모드로 전환');
    }
  }

  /* =========================================================
     2. 팀원 프로필 수정 모달 로직
     ========================================================= */
  const profileModal = document.getElementById('profileModal');
  const profileModalOverlay = document.getElementById('modalOverlay');
  const profileModalCloseBtn = document.getElementById('modalCloseBtn');
  const profileModalCancelBtn = document.getElementById('modalCancelBtn');
  const profileForm = document.getElementById('profileEditForm');

  const editMemberId = document.getElementById('editMemberId');
  const editName = document.getElementById('editName');
  const editRole = document.getElementById('editRole');
  const editDesc = document.getElementById('editDesc');
  const editAvatarInput = document.getElementById('editAvatarInput');
  const editAvatarPreview = document.getElementById('editAvatarPreview');
  const randomAvatarBtn = document.getElementById('randomAvatarBtn');

  const teamCards = document.querySelectorAll('.team-grid .card');

  loadSavedProfiles();

  teamCards.forEach(card => {
    card.addEventListener('click', () => openProfileModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openProfileModal(card);
      }
    });
  });

  function openProfileModal(card) {
    const memberId = card.dataset.memberId;
    const name = card.querySelector('h3').textContent.trim();
    const role = card.querySelector('.role').textContent.trim();
    const desc = card.querySelector('.desc').textContent.trim();
    const avatarImg = card.querySelector('.avatar-img');
    const avatarSrc = avatarImg ? avatarImg.src : '';

    editMemberId.value = memberId;
    editName.value = name;
    editRole.value = role;
    editDesc.value = desc;
    editAvatarInput.value = avatarSrc;
    updateAvatarPreview(avatarSrc);

    profileModal.classList.add('active');
    profileModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    editName.focus();
  }

  function closeProfileModal() {
    profileModal.classList.remove('active');
    profileModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  profileModalCloseBtn.addEventListener('click', closeProfileModal);
  profileModalCancelBtn.addEventListener('click', closeProfileModal);
  profileModalOverlay.addEventListener('click', closeProfileModal);

  function resolveAvatarUrl(inputVal) {
    const val = inputVal.trim();
    if (!val) {
      return 'https://api.dicebear.com/9.x/avataaars/svg?seed=Friend';
    }
    if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:')) {
      return val;
    }
    return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(val)}`;
  }

  function updateAvatarPreview(src) {
    editAvatarPreview.src = resolveAvatarUrl(src);
  }

  editAvatarInput.addEventListener('input', () => {
    updateAvatarPreview(editAvatarInput.value);
  });

  const cuteSeedPresets = [
    'Sparkle', 'Pebble', 'Sunny', 'Cookie', 'Muffin', 'Biscuit', 
    'Waffles', 'Peanut', 'Bubbles', 'Pip', 'Cosmo', 'Nova', 
    'Boba', 'Pudding', 'Clover', 'Mochi', 'Coco', 'Pepper'
  ];

  randomAvatarBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * cuteSeedPresets.length);
    const randomSeed = cuteSeedPresets[randomIndex];
    const newAvatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${randomSeed}`;
    editAvatarInput.value = newAvatarUrl;
    updateAvatarPreview(newAvatarUrl);
  });

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const memberId = editMemberId.value;
    const newName = editName.value.trim();
    const newRole = editRole.value.trim();
    const newDesc = editDesc.value.trim();
    const newAvatar = resolveAvatarUrl(editAvatarInput.value);

    const targetCard = document.querySelector(`.team-grid .card[data-member-id="${memberId}"]`);
    if (targetCard) {
      targetCard.querySelector('h3').textContent = newName;
      targetCard.querySelector('.role').textContent = newRole;
      targetCard.querySelector('.desc').textContent = newDesc;
      
      const avatarImg = targetCard.querySelector('.avatar-img');
      if (avatarImg) {
        avatarImg.src = newAvatar;
        avatarImg.alt = `${newName} 아바타`;
      }
      targetCard.setAttribute('aria-label', `${newName} 프로필 수정`);

      saveProfileToStorage(memberId, {
        name: newName,
        role: newRole,
        desc: newDesc,
        avatar: newAvatar
      });
    }

    closeProfileModal();
  });

  function saveProfileToStorage(id, data) {
    const profiles = JSON.parse(localStorage.getItem('team_profiles') || '{}');
    profiles[id] = data;
    localStorage.setItem('team_profiles', JSON.stringify(profiles));
  }

  function loadSavedProfiles() {
    try {
      const profiles = JSON.parse(localStorage.getItem('team_profiles') || '{}');
      Object.keys(profiles).forEach(id => {
        const data = profiles[id];
        const card = document.querySelector(`.team-grid .card[data-member-id="${id}"]`);
        if (card && data) {
          if (data.name) card.querySelector('h3').textContent = data.name;
          if (data.role) card.querySelector('.role').textContent = data.role;
          if (data.desc) card.querySelector('.desc').textContent = data.desc;
          if (data.avatar) {
            const img = card.querySelector('.avatar-img');
            if (img) {
              img.src = data.avatar;
              img.alt = `${data.name || ''} 아바타`;
            }
          }
          if (data.name) card.setAttribute('aria-label', `${data.name} 프로필 수정`);
        }
      });
    } catch (err) {
      console.warn('저장된 프로필을 불러오지 못했습니다:', err);
    }
  }

  /* =========================================================
     3. 팀 프로젝트 진행률 & 마일스톤 관리 로직
     ========================================================= */
  const projectModal = document.getElementById('projectModal');
  const projectModalOverlay = document.getElementById('projectModalOverlay');
  const projectModalCloseBtn = document.getElementById('projectModalCloseBtn');
  const projectModalCancelBtn = document.getElementById('projectModalCancelBtn');
  const projectCreateForm = document.getElementById('projectCreateForm');
  const openProjectModalCard = document.getElementById('openProjectModalCard');

  const projectNameInput = document.getElementById('projectName');
  const projectSubtitleInput = document.getElementById('projectSubtitle');
  const projectDescInput = document.getElementById('projectDesc');
  const projectTagsInput = document.getElementById('projectTags');
  const projectStatusSelect = document.getElementById('projectStatus');
  const projectProgressSlider = document.getElementById('projectProgress');
  const progressValueText = document.getElementById('progressValueText');

  // 팀원 이름별 아바타 이미지 매핑
  const memberAvatarMap = {
    '김수연': 'https://api.dicebear.com/9.x/avataaars/svg?seed=Suyeon',
    '이한서': 'https://api.dicebear.com/9.x/avataaars/svg?seed=Hanseo',
    '김은진': 'https://api.dicebear.com/9.x/avataaars/svg?seed=Eunjin',
    '정나연': 'https://api.dicebear.com/9.x/avataaars/svg?seed=Nayeon'
  };

  // 진행률 슬라이더 값 실시간 표시
  if (projectProgressSlider && progressValueText) {
    projectProgressSlider.addEventListener('input', () => {
      progressValueText.textContent = `${projectProgressSlider.value}%`;
    });
  }

  // 초기 프로젝트 데이터 로드 (기본 프로젝트 프리셋 제공)
  let projects = [];
  const storedProjects = localStorage.getItem('team_projects');

  if (storedProjects !== null) {
    try {
      projects = JSON.parse(storedProjects);
    } catch (e) {
      projects = [];
    }
  } else {
    // 최초 방문 시 풍성한 초기 프로젝트 데이터 제공
    projects = [
      {
        id: 'proj_campusmate',
        name: 'CampusMate (캠퍼스 메이트)',
        subtitle: '대학생을 위한 스마트 스터디 매칭 & 협업 워크스페이스',
        desc: '학기 중 흩어져 있는 팀 프로젝트 구인, 실시간 회의 및 칸반 보드 협업을 하나로 통합하는 올인원 웹 플랫폼입니다.',
        status: 'development',
        progress: 65,
        members: ['김수연', '이한서', '김은진', '정나연'],
        tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Socket.io']
      },
      {
        id: 'proj_portfolio',
        name: '팀 포트폴리오 웹사이트',
        subtitle: '팀원 소개 및 프로젝트 진척도 시각화 플랫폼',
        desc: '우리 팀의 핵심 역량과 프로젝트 진행률을 실시간으로 투명하게 공유할 수 있는 반응형 웹 포트폴리오입니다.',
        status: 'testing',
        progress: 85,
        members: ['김수연', '정나연'],
        tags: ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI']
      }
    ];
    saveProjectsToStorage();
  }

  renderProjects();

  // '+ 새 프로젝트 등록하기' 카드 클릭 이벤트
  openProjectModalCard.addEventListener('click', openProjectModal);
  openProjectModalCard.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openProjectModal();
    }
  });

  function openProjectModal() {
    projectCreateForm.reset();
    projectProgressSlider.value = 65;
    progressValueText.textContent = '65%';
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    projectNameInput.focus();
  }

  function closeProjectModal() {
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  projectModalCloseBtn.addEventListener('click', closeProjectModal);
  projectModalCancelBtn.addEventListener('click', closeProjectModal);
  projectModalOverlay.addEventListener('click', closeProjectModal);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (profileModal.classList.contains('active')) closeProfileModal();
      if (projectModal.classList.contains('active')) closeProjectModal();
    }
  });

  // 새 프로젝트 등록 폼 제출
  projectCreateForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = projectNameInput.value.trim();
    const subtitle = projectSubtitleInput.value.trim();
    const desc = projectDescInput.value.trim();
    const status = projectStatusSelect.value;
    const progress = parseInt(projectProgressSlider.value, 10) || 0;
    const rawTags = projectTagsInput.value.trim();

    // 선택된 팀원 목록
    const selectedMembers = Array.from(
      projectCreateForm.querySelectorAll('input[name="assignedMember"]:checked')
    ).map(cb => cb.value);

    const tags = rawTags
      ? rawTags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    const newProject = {
      id: 'proj_' + Date.now(),
      name,
      subtitle,
      desc,
      status,
      progress,
      members: selectedMembers.length > 0 ? selectedMembers : ['김수연'],
      tags
    };

    projects.push(newProject);
    saveProjectsToStorage();
    renderProjects();
    closeProjectModal();
  });

  function deleteProject(id) {
    projects = projects.filter(p => p.id !== id);
    saveProjectsToStorage();
    renderProjects();
  }

  function saveProjectsToStorage() {
    localStorage.setItem('team_projects', JSON.stringify(projects));
  }

  function renderProjects() {
    const emptyState = document.getElementById('projectEmptyState');
    const projectGrid = document.getElementById('projectGrid');

    if (projects.length === 0) {
      emptyState.style.display = 'block';
    } else {
      emptyState.style.display = 'none';
    }

    // 기존 렌더링된 프로젝트 카드 제거
    projectGrid.querySelectorAll('.project-item-card').forEach(el => el.remove());

    // 프로젝트 카드 렌더링
    projects.forEach(project => {
      const card = createProjectCardElement(project);
      projectGrid.insertBefore(card, openProjectModalCard);
    });
  }

  // 상태 배지 메타데이터
  const statusMetaMap = {
    'planning': { label: '📝 기획 단계', className: 'status-planning' },
    'design': { label: '🎨 디자인 단계', className: 'status-design' },
    'development': { label: '🔥 개발 진행 중', className: 'status-dev' },
    'testing': { label: '🧪 테스트 및 검증', className: 'status-testing' },
    'completed': { label: '✅ 완료 및 배포', className: 'status-completed' }
  };

  function createProjectCardElement(project) {
    const card = document.createElement('div');
    card.className = 'project-item-card';
    card.dataset.projectId = project.id;

    const progress = Math.min(100, Math.max(0, project.progress || 0));
    const statusMeta = statusMetaMap[project.status] || { label: '진행 중', className: '' };

    // 진행 단계 타임라인 상태 계산 (Planning -> Design -> Dev -> Testing)
    // 0~25%: Planning active
    // 26~50%: Design active, Planning done
    // 51~80%: Dev active, Planning & Design done
    // 81~99%: Testing active, Planning & Design & Dev done
    // 100%: All completed
    let pClass = 'active', dClass = 'pending', devClass = 'pending', tClass = 'pending';
    let conn1 = '', conn2 = '', conn3 = '';

    if (progress >= 100) {
      pClass = 'completed'; dClass = 'completed'; devClass = 'completed'; tClass = 'completed';
      conn1 = 'completed'; conn2 = 'completed'; conn3 = 'completed';
    } else if (progress >= 75) {
      pClass = 'completed'; dClass = 'completed'; devClass = 'completed'; tClass = 'active';
      conn1 = 'completed'; conn2 = 'completed'; conn3 = 'completed';
    } else if (progress >= 50) {
      pClass = 'completed'; dClass = 'completed'; devClass = 'active'; tClass = 'pending';
      conn1 = 'completed'; conn2 = 'completed';
    } else if (progress >= 25) {
      pClass = 'completed'; dClass = 'active'; devClass = 'pending'; tClass = 'pending';
      conn1 = 'completed';
    }

    // 담당 팀원 아바타 스택 HTML 생성
    const members = project.members && project.members.length > 0 ? project.members : ['김수연'];
    const memberAvatarsHtml = members.map(m => {
      const avatarUrl = memberAvatarMap[m] || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(m)}`;
      return `<img src="${avatarUrl}" alt="${escapeHtml(m)}" class="mini-avatar" title="담당 팀원: ${escapeHtml(m)}">`;
    }).join('');

    // 기술 태그 HTML
    const tagsHtml = (project.tags && project.tags.length > 0)
      ? project.tags.map(tag => `<span class="tech-tag">${escapeHtml(tag)}</span>`).join('')
      : '';

    card.innerHTML = `
      <div class="project-card-top">
        <div class="project-card-header">
          <span class="status-badge ${statusMeta.className}">${statusMeta.label}</span>
          <button type="button" class="btn-delete-project" title="프로젝트 삭제">🗑️ 삭제</button>
        </div>

        <h3 class="project-item-title">${escapeHtml(project.name)}</h3>
        <p class="project-item-subtitle">${escapeHtml(project.subtitle)}</p>

        <!-- 진행률 프로그레스 바 -->
        <div class="project-progress-wrapper">
          <div class="progress-header">
            <span class="progress-label">전체 진행률</span>
            <span class="progress-percent">${progress}% Completed</span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${progress}%;"></div>
          </div>
        </div>

        <!-- 4단계 마일스톤 타임라인 체크리스트 -->
        <div class="project-phases-timeline">
          <div class="phase-step ${pClass}">
            <span class="step-dot">${pClass === 'completed' ? '✓' : '●'}</span>
            <span class="step-name">Planning</span>
          </div>
          <div class="phase-connector ${conn1}"></div>
          <div class="phase-step ${dClass}">
            <span class="step-dot">${dClass === 'completed' ? '✓' : (dClass === 'active' ? '●' : '○')}</span>
            <span class="step-name">Design</span>
          </div>
          <div class="phase-connector ${conn2}"></div>
          <div class="phase-step ${devClass}">
            <span class="step-dot">${devClass === 'completed' ? '✓' : (devClass === 'active' ? '●' : '○')}</span>
            <span class="step-name">Dev</span>
          </div>
          <div class="phase-connector ${conn3}"></div>
          <div class="phase-step ${tClass}">
            <span class="step-dot">${tClass === 'completed' ? '✓' : (tClass === 'active' ? '●' : '○')}</span>
            <span class="step-name">Testing</span>
          </div>
        </div>

        <div class="project-item-desc">${escapeHtml(project.desc)}</div>
      </div>

      <!-- 하단 메타 영역: 담당 팀원 아바타 & 기술 태그 -->
      <div class="project-card-footer">
        <div class="assigned-members-group">
          <span class="meta-label">담당 팀원</span>
          <div class="avatar-stack">
            ${memberAvatarsHtml}
          </div>
        </div>
        ${tagsHtml ? `<div class="tech-tags">${tagsHtml}</div>` : ''}
      </div>
    `;

    // 삭제 버튼 클릭 이벤트
    card.querySelector('.btn-delete-project').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`'${project.name}' 프로젝트를 삭제하시겠습니까?`)) {
        deleteProject(project.id);
      }
    });

    return card;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
