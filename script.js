// البيانات الأولية
let data = {
  users: [
      { id: 1, username: 'admin', password: 'admin123', name: 'المدير الرئيسي', role: 'admin' },
      { id: 2, username: 'rep1', password: 'rep123', name: 'المندوب الأول', role: 'rep' }
  ],
  doctors: [
      { id: 1, name: 'د. أحمد محمد', area: 'المنطقة الشمالية', address: '123 شارع الجامعة', class: 'أ' },
      { id: 2, name: 'د. علي محمود', area: 'المنطقة الجنوبية', address: '456 شارع النخيل', class: 'ب' },
      { id: 3, name: 'د. سارة خالد', area: 'المنطقة الشمالية', address: '789 شارع الملك', class: 'أ' }
  ],
  medicines: [
      { id: 1, name: 'دواء 1' },
      { id: 2, name: 'دواء 2' },
      { id: 3, name: 'دواء 3' }
  ],
  visits: [],
  settings: { visit_time: '09:00' }
};

// تحميل البيانات من localStorage
function loadData() {
  const savedData = localStorage.getItem('medicalSystemData');
  if (savedData) {
      data = JSON.parse(savedData);
  }
}

// حفظ البيانات في localStorage
function saveData() {
  localStorage.setItem('medicalSystemData', JSON.stringify(data));
}

// تسجيل الدخول
function login(username, password) {
  const user = data.users.find(u => u.username === username && u.password === password);
  if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      return user;
  }
  return null;
}

// تسجيل الخروج
function logout() {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}

// ========== أحداث النظام ========== //

// عند تحميل الصفحة
loadData();

// صفحة تسجيل الدخول
document.getElementById('loginForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  const user = login(username, password);
  
  if (user) {
      if (user.role === 'admin') {
          window.location.href = 'admin.html';
      } else {
          window.location.href = 'rep.html';
      }
  } else {
      alert('اسم المستخدم أو كلمة المرور غير صحيحة');
  }
});

// صفحة المدير
if (window.location.pathname.endsWith('admin.html')) {
  document.addEventListener('DOMContentLoaded', function() {
      const user = JSON.parse(sessionStorage.getItem('currentUser'));
      if (!user || user.role !== 'admin') {
          window.location.href = 'index.html';
          return;
      }

      // عرض المناديب
      function loadReps() {
          const tbody = document.querySelector('#repsTable tbody');
          tbody.innerHTML = data.users
              .filter(u => u.role === 'rep')
              .map(rep => `
              <tr>
                  <td><a href="#" onclick="showRepVisits(${rep.id}, '${rep.name}')" class="rep-name-link">${rep.name}</a></td>
                  <td>${rep.username}</td>
                  <td>${data.visits.filter(v => v.rep_id === rep.id).length}</td>
                  <td>
                      <button onclick="deleteUser(${rep.id})" class="delete-btn">حذف</button>
                  </td>
              </tr>
              `).join('');
      }

      // عرض الأطباء
      function loadDoctors() {
          const tbody = document.querySelector('#doctorsTable tbody');
          tbody.innerHTML = data.doctors.map(doctor => `
              <tr>
                  <td>${doctor.name}</td>
                  <td>${doctor.area}</td>
                  <td>${doctor.address}</td>
                  <td>${doctor.class}</td>
                  <td>
                      <button onclick="deleteDoctor(${doctor.id})" class="delete-btn">حذف</button>
                  </td>
              </tr>
          `).join('');
      }

      // عرض الأدوية
      function loadMedicines() {
          const tbody = document.querySelector('#medicinesTable tbody');
          tbody.innerHTML = data.medicines.map(medicine => `
              <tr>
                  <td>${medicine.name}</td>
                  <td>
                      <button onclick="deleteMedicine(${medicine.id})" class="delete-btn">حذف</button>
                  </td>
              </tr>
          `).join('');
      }

      // عرض تفاصيل زيارات المندوب
      window.showRepVisits = function(repId, repName) {
          const modal = document.getElementById('visitsModal');
          const repVisits = data.visits.filter(v => v.rep_id === repId);
          
          document.getElementById('modalRepName').textContent = repName;
          
          const tbody = document.querySelector('#visitsDetailsTable tbody');
          tbody.innerHTML = repVisits.map(visit => {
              const doctor = data.doctors.find(d => d.id === visit.doctor_id);
              const meds = visit.medicines.map(id => 
                  data.medicines.find(m => m.id === id)?.name || 'غير معروف'
              ).join(', ');
              
              return `
              <tr>
                  <td>${new Date(visit.date).toLocaleString()}</td>
                  <td>${doctor?.name || 'غير معروف'}</td>
                  <td>${meds}</td>
                  <td>${visit.notes || 'لا يوجد'}</td>
              </tr>
              `;
          }).join('');
          
          modal.style.display = 'block';
      };

      // حذف مستخدم
      window.deleteUser = function(id) {
          if (confirm('هل أنت متأكد من حذف المندوب؟')) {
              data.users = data.users.filter(u => u.id !== id);
              saveData();
              loadReps();
          }
      };

      // حذف طبيب
      window.deleteDoctor = function(id) {
          if (confirm('هل أنت متأكد من حذف الطبيب؟')) {
              data.doctors = data.doctors.filter(d => d.id !== id);
              saveData();
              loadDoctors();
          }
      };

      // حذف دواء
      window.deleteMedicine = function(id) {
          if (confirm('هل أنت متأكد من حذف الدواء؟')) {
              data.medicines = data.medicines.filter(m => m.id === id);
              saveData();
              loadMedicines();
          }
      };

      // إضافة مندوب
      document.getElementById('addRepBtn').addEventListener('click', function() {
          const name = prompt('اسم المندوب:');
          const username = prompt('اسم المستخدم:');
          const password = prompt('كلمة المرور:');
          
          if (name && username && password) {
              const newRep = {
                  id: data.users.length + 1,
                  name,
                  username,
                  password,
                  role: 'rep'
              };
              data.users.push(newRep);
              saveData();
              loadReps();
          }
      });

      // إضافة طبيب
      document.getElementById('addDoctorBtn').addEventListener('click', function() {
          const name = prompt('اسم الطبيب:');
          const area = prompt('المحافظة:');
          const address = prompt('العنوان:');
          const className = prompt('التخصص:');
          
          if (name && area && address && className) {
              const newDoctor = {
                  id: data.doctors.length + 1,
                  name,
                  area,
                  address,
                  class: className
              };
              data.doctors.push(newDoctor);
              saveData();
              loadDoctors();
          }
      });

      // إضافة دواء
      document.getElementById('addMedicineBtn').addEventListener('click', function() {
          const name = prompt('اسم الدواء:');
          if (name) {
              const newMedicine = {
                  id: data.medicines.length + 1,
                  name
              };
              data.medicines.push(newMedicine);
              saveData();
              loadMedicines();
          }
      });

      // التحميل الأولي
      loadReps();
      loadDoctors();
      loadMedicines();
  });
}

// صفحة المندوب
if (window.location.pathname.endsWith('rep.html')) {
  document.addEventListener('DOMContentLoaded', function() {
      const user = JSON.parse(sessionStorage.getItem('currentUser'));
      if (!user || user.role !== 'rep') {
          window.location.href = 'index.html';
          return;
      }

      document.getElementById('repName').textContent = user.name;

      // ملء قائمة المحافظات
      const areaSelect = document.getElementById('area');
      const areas = [...new Set(data.doctors.map(d => d.area))];
      areaSelect.innerHTML = '<option value="">اختر المحافظة</option>' + 
          areas.map(area => `<option value="${area}">${area}</option>`).join('');

      // عند تغيير المحافظة
      areaSelect.addEventListener('change', function() {
          const doctorSelect = document.getElementById('doctor');
          doctorSelect.innerHTML = '<option value="">اختر الطبيب</option>';
          
          if (this.value) {
              const doctorsInArea = data.doctors.filter(d => d.area === this.value);
              doctorSelect.innerHTML += doctorsInArea.map(d => 
                  `<option value="${d.id}">${d.name} - ${d.class}</option>`).join('');
              doctorSelect.disabled = false;
          } else {
              doctorSelect.disabled = true;
          }
      });

      // ملء قائمة الأدوية
      const medicineSelect = document.getElementById('medicine');
      medicineSelect.innerHTML = data.medicines.map(m => 
          `<option value="${m.id}">${m.name}</option>`).join('');

      // عرض الزيارات
      function loadVisits() {
          const tbody = document.querySelector('#visitsTable tbody');
          tbody.innerHTML = data.visits
              .filter(v => v.rep_id === user.id)
              .map(visit => {
                  const doctor = data.doctors.find(d => d.id === visit.doctor_id);
                  const meds = visit.medicines.map(id => 
                      data.medicines.find(m => m.id === id)?.name || 'غير معروف'
                  ).join(', ');
                  
                  return `
                      <tr>
                          <td>${new Date(visit.date).toLocaleString()}</td>
                          <td>${doctor?.name || 'غير معروف'}</td>
                          <td>${meds}</td>
                          <td>${visit.notes || 'لا يوجد'}</td>
                      </tr>
                  `;
              }).join('');
      }

      // إضافة زيارة
      document.getElementById('visitForm').addEventListener('submit', function(e) {
          e.preventDefault();
          
          const doctorId = parseInt(document.getElementById('doctor').value);
          const meds = Array.from(document.getElementById('medicine').selectedOptions)
              .map(opt => parseInt(opt.value));
          const notes = document.getElementById('notes').value;
          
          if (!doctorId || meds.length === 0) {
              alert('يجب اختيار طبيب وعلاجات');
              return;
          }
          
          const newVisit = {
              id: data.visits.length + 1,
              rep_id: user.id,
              doctor_id: doctorId,
              date: new Date().toISOString(),
              medicines: meds,
              notes
          };
          
          data.visits.push(newVisit);
          saveData();
          loadVisits();
          this.reset();
          document.getElementById('area').value = '';
          document.getElementById('doctor').disabled = true;
          alert('تم تسجيل الزيارة بنجاح');
      });

      loadVisits();
  });
}

// تسجيل الخروج
document.getElementById('logoutBtn')?.addEventListener('click', logout);

// إغلاق نافذة تفاصيل الزيارات عند النقر على زر الإغلاق
document.querySelector('.close-modal')?.addEventListener('click', function() {
  document.getElementById('visitsModal').style.display = 'none';
});

// إغلاق نافذة تفاصيل الزيارات عند النقر خارجها
window.addEventListener('click', function(event) {
  const modal = document.getElementById('visitsModal');
  if (event.target === modal) {
      modal.style.display = 'none';
  }
});