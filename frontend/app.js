// خلدون للأرشيف المالي - منطق الواجهة الأمامية والاتصال بالذكاء الاصطناعي وماكينة التصوير
document.addEventListener("DOMContentLoaded", () => {
  const state = {
    page: 1,
    limit: 24,
    totalPages: 1,
    search: "",
    hasSignature: null,
    hasHandwriting: null,
    hasSpecialMarks: null,
    docType: "الكل",
    delegateName: "الكل",
    minAmount: null,
    maxAmount: null,
    selectedCopier: "all",
    copiersList: [],
    selectedDocIds: new Set(),
    advFilters: {
      sigQuery: "",
      hwQuery: "",
      marksQuery: "",
      fullTextQuery: "",
      dateFrom: "",
      dateTo: "",
      minAmount: null,
      maxAmount: null
    },
    currentDoc: null,
    zoomLevel: 1,
    rotation: 0,
    pollInterval: null
  };

  // --- عناصر DOM وماكينات الشير ---
  const copierDropdown = document.getElementById("copierDropdown");
  const btnOpenCopiersManager = document.getElementById("btnOpenCopiersManager");
  const copiersManagerModal = document.getElementById("copiersManagerModal");
  const btnCloseCopiersModal = document.getElementById("btnCloseCopiersModal");
  const copierCountBadge = document.getElementById("copierCountBadge");
  const copierSharedNetworkPath = document.getElementById("copierSharedNetworkPath");
  const btnCopySmbShare = document.getElementById("btnCopySmbShare");
  const btnDiscoverNetwork = document.getElementById("btnDiscoverNetwork");
  const btnToggleAddCopier = document.getElementById("btnToggleAddCopier");
  const addCopierFormCard = document.getElementById("addCopierFormCard");
  const btnCancelAddCopier = document.getElementById("btnCancelAddCopier");
  const btnSaveNewCopier = document.getElementById("btnSaveNewCopier");
  const discoveryResultsPanel = document.getElementById("discoveryResultsPanel");
  const discoveryList = document.getElementById("discoveryList");
  const copiersCardsContainer = document.getElementById("copiersCardsContainer");

  const newCopierName = document.getElementById("newCopierName");
  const newCopierBrand = document.getElementById("newCopierBrand");
  const newCopierIp = document.getElementById("newCopierIp");
  const newCopierLocation = document.getElementById("newCopierLocation");

  // --- عناصر DOM ---
  const statTotalDocs = document.getElementById("statTotalDocs");
  const statSignedDocs = document.getElementById("statSignedDocs");
  const statSignedRatio = document.getElementById("statSignedRatio");
  const statHandwritingDocs = document.getElementById("statHandwritingDocs");
  const statMarkedDocs = document.getElementById("statMarkedDocs");
  const statTotalAmount = document.getElementById("statTotalAmount");
  const statTotalBatches = document.getElementById("statTotalBatches");

  const batchProgressWrapper = document.getElementById("batchProgressWrapper");
  const batchProgressName = document.getElementById("batchProgressName");
  const batchBoxTag = document.getElementById("batchBoxTag");
  const batchProgressBarFill = document.getElementById("batchProgressBarFill");
  const batchProgressCount = document.getElementById("batchProgressCount");
  const batchProgressPercent = document.getElementById("batchProgressPercent");

  const documentsContainer = document.getElementById("documentsContainer");
  const resultsCountText = document.getElementById("resultsCountText");
  const paginationBar = document.getElementById("paginationBar");
  const paginationInfo = document.getElementById("paginationInfo");
  const btnPrevPage = document.getElementById("btnPrevPage");
  const btnNextPage = document.getElementById("btnNextPage");

  const mainSearchInput = document.getElementById("mainSearchInput");
  const btnSearchTrigger = document.getElementById("btnSearchTrigger");
  const btnClearSearch = document.getElementById("btnClearSearch");
  const filterChips = document.querySelectorAll(".filter-chip");
  const filterDocType = document.getElementById("filterDocType");
  const filterDelegate = document.getElementById("filterDelegate");
  const filterMinAmount = document.getElementById("filterMinAmount");
  const filterMaxAmount = document.getElementById("filterMaxAmount");
  const btnResetFilters = document.getElementById("btnResetFilters");

  // أزرار البحث الجديد والحذف وتحديد الكل
  const btnQuickDeleteSearch = document.getElementById("btnQuickDeleteSearch");
  const btnOpenAdvancedSearch = document.getElementById("btnOpenAdvancedSearch");
  const btnOpenManualAdd = document.getElementById("btnOpenManualAdd");
  const btnOpenCleanupOld = document.getElementById("btnOpenCleanupOld");

  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const selectedCountBadge = document.getElementById("selectedCountBadge");
  const bulkActionsToolbar = document.getElementById("bulkActionsToolbar");
  const btnBulkDeleteSelected = document.getElementById("btnBulkDeleteSelected");
  const btnBulkPrintSelected = document.getElementById("btnBulkPrintSelected");
  const btnDeselectAll = document.getElementById("btnDeselectAll");
  const bulkDeleteCount = document.getElementById("bulkDeleteCount");

  // أزرار الورقة (تنزيل PDF، طباعة، وحذف)
  const btnDownloadDocPdf = document.getElementById("btnDownloadDocPdf");
  const btnPrintDoc = document.getElementById("btnPrintDoc");
  const btnDeleteSingleDoc = document.getElementById("btnDeleteSingleDoc");

  // نوافذ المودال الجديدة
  const advancedSearchModal = document.getElementById("advancedSearchModal");
  const btnCloseAdvSearchModal = document.getElementById("btnCloseAdvSearchModal");
  const btnResetAdvSearch = document.getElementById("btnResetAdvSearch");
  const btnExecuteAdvSearch = document.getElementById("btnExecuteAdvSearch");
  const advSigQuery = document.getElementById("advSigQuery");
  const advHwQuery = document.getElementById("advHwQuery");
  const advMarksQuery = document.getElementById("advMarksQuery");
  const advFullTextQuery = document.getElementById("advFullTextQuery");
  const advDateFrom = document.getElementById("advDateFrom");
  const advDateTo = document.getElementById("advDateTo");
  const advMinAmount = document.getElementById("advMinAmount");
  const advMaxAmount = document.getElementById("advMaxAmount");

  const manualDocModal = document.getElementById("manualDocModal");
  const btnCloseManualDocModal = document.getElementById("btnCloseManualDocModal");
  const btnCancelManualDoc = document.getElementById("btnCancelManualDoc");
  const btnSaveManualDoc = document.getElementById("btnSaveManualDoc");

  const cleanupOldModal = document.getElementById("cleanupOldModal");
  const btnCloseCleanupModal = document.getElementById("btnCloseCleanupModal");
  const btnCancelCleanup = document.getElementById("btnCancelCleanup");
  const btnConfirmCleanup = document.getElementById("btnConfirmCleanup");

  const botChatMessages = document.getElementById("botChatMessages");
  const botInputText = document.getElementById("botInputText");
  const btnSendBot = document.getElementById("btnSendBot");
  const btnClearChat = document.getElementById("btnClearChat");
  const quickPills = document.querySelectorAll(".quick-pill");

  // نوافذ المودال
  const docModal = document.getElementById("docModal");
  const btnCloseModal = document.getElementById("btnCloseModal");
  const modalDocTitle = document.getElementById("modalDocTitle");
  const modalDocNumber = document.getElementById("modalDocNumber");
  const modalDocPhysicalBox = document.getElementById("modalDocPhysicalBox");
  const modalDocImage = document.getElementById("modalDocImage");
  const modalDocAmount = document.getElementById("modalDocAmount");
  const modalDocDate = document.getElementById("modalDocDate");
  const modalDocParty = document.getElementById("modalDocParty");
  const modalDocDelegate = document.getElementById("modalDocDelegate");
  const badgeModalSigStatus = document.getElementById("badgeModalSigStatus");
  const modalSigText = document.getElementById("modalSigText");
  const badgeModalHwStatus = document.getElementById("badgeModalHwStatus");
  const modalHwText = document.getElementById("modalHwText");
  const badgeModalMarksStatus = document.getElementById("badgeModalMarksStatus");
  const modalMarksText = document.getElementById("modalMarksText");
  const modalPhysicalLocation = document.getElementById("modalPhysicalLocation");

  const btnZoomIn = document.getElementById("btnZoomIn");
  const btnZoomOut = document.getElementById("btnZoomOut");
  const btnRotate = document.getElementById("btnRotate");
  const btnOpenNewTab = document.getElementById("btnOpenNewTab");

  // عناصر عدسة التكبير والتصغير والبحث المطور في الصورة
  const inDocSearchInput = document.getElementById("inDocSearchInput");
  const btnInDocSearch = document.getElementById("btnInDocSearch");
  const btnClearInDocSearch = document.getElementById("btnClearInDocSearch");
  const inDocMatchBadge = document.getElementById("inDocMatchBadge");
  const btnToggleMagnifier = document.getElementById("btnToggleMagnifier");
  const magnifierBtnLabel = document.getElementById("magnifierBtnLabel");
  const selectMagnifierPower = document.getElementById("selectMagnifierPower");
  const docImageContainer = document.getElementById("docImageContainer");
  const imageMagnifierLens = document.getElementById("imageMagnifierLens");
  const docHighlightOverlay = document.getElementById("docHighlightOverlay");
  const cardInDocMatches = document.getElementById("cardInDocMatches");
  const badgeMatchCount = document.getElementById("badgeMatchCount");
  const inDocMatchesList = document.getElementById("inDocMatchesList");
  const modalDocVehicle = document.getElementById("modalDocVehicle");
  const modalDocVehicleCode = document.getElementById("modalDocVehicleCode");

  // عناصر أسطول العربيات والمناديب
  const btnOpenVehiclesHub = document.getElementById("btnOpenVehiclesHub");
  const vehiclesDossierModal = document.getElementById("vehiclesDossierModal");
  const btnCloseVehiclesModal = document.getElementById("btnCloseVehiclesModal");
  const btnWipeOldDelegates = document.getElementById("btnWipeOldDelegates");
  const btnToggleAddVehicle = document.getElementById("btnToggleAddVehicle");
  const addVehicleFormCard = document.getElementById("addVehicleFormCard");
  const btnCancelAddVehicle = document.getElementById("btnCancelAddVehicle");
  const btnSaveNewVehicle = document.getElementById("btnSaveNewVehicle");
  const searchVehiclesInput = document.getElementById("searchVehiclesInput");
  const fleetVehicleCountBadge = document.getElementById("fleetVehicleCountBadge");
  const fleetActiveCount = document.getElementById("fleetActiveCount");
  const fleetTotalInvoices = document.getElementById("fleetTotalInvoices");
  const vehiclesGridContainer = document.getElementById("vehiclesGridContainer");

  // عناصر ملف العربية الشامل
  const singleVehicleDossierModal = document.getElementById("singleVehicleDossierModal");
  const btnCloseSingleVehicleModal = document.getElementById("btnCloseSingleVehicleModal");
  const btnPrintVehicleDossier = document.getElementById("btnPrintVehicleDossier");
  const btnExportVehicleDossier = document.getElementById("btnExportVehicleDossier");

  // عناصر إدارة ومراقبة المخزون
  const btnOpenInventoryHub = document.getElementById("btnOpenInventoryHub");
  const inventoryHubModal = document.getElementById("inventoryHubModal");
  const btnCloseInventoryModal = document.getElementById("btnCloseInventoryModal");
  const btnToggleAddStockTrans = document.getElementById("btnToggleAddStockTrans");
  const btnToggleAddStockItem = document.getElementById("btnToggleAddStockItem");
  const addStockTransFormCard = document.getElementById("addStockTransFormCard");
  const btnCancelAddTrans = document.getElementById("btnCancelAddTrans");
  const btnSaveStockTrans = document.getElementById("btnSaveStockTrans");
  const addStockItemFormCard = document.getElementById("addStockItemFormCard");
  const btnCancelAddItem = document.getElementById("btnCancelAddItem");
  const btnSaveStockItem = document.getElementById("btnSaveStockItem");
  const inventoryItemsTableBody = document.getElementById("inventoryItemsTableBody");
  const inventoryTransTableBody = document.getElementById("inventoryTransTableBody");
  const transVehicleCode = document.getElementById("transVehicleCode");
  const transItemSelect = document.getElementById("transItemSelect");
  const invStatTotalItems = document.getElementById("invStatTotalItems");
  const invStatTotalValue = document.getElementById("invStatTotalValue");
  const invStatLowStock = document.getElementById("invStatLowStock");
  const invStatVehicleTransfers = document.getElementById("invStatVehicleTransfers");

  // عناصر بوابة ERP
  const btnOpenErpHub = document.getElementById("btnOpenErpHub");
  const erpHubModal = document.getElementById("erpHubModal");
  const btnCloseErpModal = document.getElementById("btnCloseErpModal");
  const erpSystemType = document.getElementById("erpSystemType");
  const erpServerUrl = document.getElementById("erpServerUrl");
  const erpCompanyId = document.getElementById("erpCompanyId");
  const erpApiKey = document.getElementById("erpApiKey");
  const erpWebhookUrl = document.getElementById("erpWebhookUrl");
  const erpSyncInterval = document.getElementById("erpSyncInterval");
  const erpAutoSync = document.getElementById("erpAutoSync");
  const btnTestErpConnection = document.getElementById("btnTestErpConnection");
  const btnSaveErpConfig = document.getElementById("btnSaveErpConfig");
  const btnSyncErpNow = document.getElementById("btnSyncErpNow");
  const erpSyncLogsTableBody = document.getElementById("erpSyncLogsTableBody");
  const erpLiveStatusBadge = document.getElementById("erpLiveStatusBadge");
  const erpSelectedName = document.getElementById("erpSelectedName");

  // أزرار الهيدر
  const btnGen1000 = document.getElementById("btnGen1000");
  const btnQuickScan = document.getElementById("btnQuickScan");
  const btnUploadModal = document.getElementById("btnUploadModal");
  const btnCopierGuide = document.getElementById("btnCopierGuide");
  const btnSettings = document.getElementById("btnSettings");

  const copierGuideModal = document.getElementById("copierGuideModal");
  const btnCloseGuideModal = document.getElementById("btnCloseGuideModal");
  const btnCopyHotPath = document.getElementById("btnCopyHotPath");
  const hotFolderPathDisplay = document.getElementById("hotFolderPathDisplay");

  const uploadModal = document.getElementById("uploadModal");
  const btnCloseUploadModal = document.getElementById("btnCloseUploadModal");
  const dropZone = document.getElementById("dropZone");
  const manualFileInput = document.getElementById("manualFileInput");
  const uploadFileList = document.getElementById("uploadFileList");
  const btnSubmitUpload = document.getElementById("btnSubmitUpload");

  const settingsModal = document.getElementById("settingsModal");
  const btnCloseSettingsModal = document.getElementById("btnCloseSettingsModal");
  const settingSysName = document.getElementById("settingSysName");
  const settingApiKey = document.getElementById("settingApiKey");
  const settingHotFolder = document.getElementById("settingHotFolder");
  const btnSaveSettings = document.getElementById("btnSaveSettings");

  // --- تحميل الإحصائيات الحية ---
  async function loadStats() {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();

      statTotalDocs.textContent = Number(data.total_documents).toLocaleString('ar-EG');
      statSignedDocs.textContent = Number(data.signed_documents).toLocaleString('ar-EG');
      statHandwritingDocs.textContent = Number(data.handwriting_documents).toLocaleString('ar-EG');
      statMarkedDocs.textContent = Number(data.marked_documents).toLocaleString('ar-EG');
      statTotalAmount.textContent = `${Number(data.total_financial_volume).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`;
      statTotalBatches.textContent = `${data.total_batches} دفعة مسحوبة من الماكينة`;

      if (data.total_documents > 0) {
        const ratio = Math.round((data.signed_documents / data.total_documents) * 100);
        statSignedRatio.textContent = `${ratio}% نسبة الوثائق الموقعة`;
      }

      if (data.watch_folder && hotFolderPathDisplay) {
        hotFolderPathDisplay.textContent = data.watch_folder;
      }

      // متابعة الدفعة النشطة
      if (data.active_batch && data.active_batch.status === "processing") {
        batchProgressWrapper.style.display = "block";
        batchProgressName.textContent = data.active_batch.batch_name;
        batchBoxTag.textContent = data.active_batch.physical_box || "صندوق الأرشيف الجاري حفظه";
        const total = data.active_batch.total_pages || 1000;
        const processed = data.active_batch.processed_pages || 0;
        const pct = Math.min(100, Math.round((processed / total) * 100));

        batchProgressBarFill.style.width = `${pct}%`;
        batchProgressCount.textContent = `${processed} / ${total} ورقة`;
        batchProgressPercent.textContent = `${pct}%`;
      } else if (data.active_batch && data.active_batch.status === "completed") {
        if (batchProgressBarFill.style.width !== "100%") {
          batchProgressBarFill.style.width = "100%";
          batchProgressPercent.textContent = "100%";
          setTimeout(() => {
            batchProgressWrapper.style.display = "none";
          }, 3500);
        }
      }
    } catch (err) {
      console.error("Stats load error:", err);
    }
  }

  // --- تحميل المستندات وتطبيق الفلاتر ---
  async function loadDocuments() {
    documentsContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #94a3b8;">
        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color: #3b82f6; margin-bottom: 12px;"></i>
        <p>جاري البحث واسترجاع المستندات من أرشيف خلدون...</p>
      </div>
    `;

    const params = new URLSearchParams({
      page: state.page,
      limit: state.limit
    });

    if (state.search) params.append("search", state.search);
    if (state.hasSignature !== null) params.append("has_signature", state.hasSignature);
    if (state.hasHandwriting !== null) params.append("has_handwriting", state.hasHandwriting);
    if (state.hasSpecialMarks !== null) params.append("has_special_marks", state.hasSpecialMarks);
    if (state.docType && state.docType !== "الكل") params.append("doc_type", state.docType);
    if (state.delegateName && state.delegateName !== "الكل") params.append("delegate_name", state.delegateName);
    if (state.selectedCopier && state.selectedCopier !== "all") params.append("copier_name", state.selectedCopier);
    if (state.minAmount !== null) params.append("min_amount", state.minAmount);
    if (state.maxAmount !== null) params.append("max_amount", state.maxAmount);

    // إضافة محددات البحث المتقدم الشامل
    if (state.advFilters.sigQuery) params.append("signature_query", state.advFilters.sigQuery);
    if (state.advFilters.hwQuery) params.append("handwriting_query", state.advFilters.hwQuery);
    if (state.advFilters.marksQuery) params.append("marks_query", state.advFilters.marksQuery);
    if (state.advFilters.fullTextQuery) params.append("full_text_query", state.advFilters.fullTextQuery);
    if (state.advFilters.dateFrom) params.append("date_from", state.advFilters.dateFrom);
    if (state.advFilters.dateTo) params.append("date_to", state.advFilters.dateTo);

    try {
      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();

      state.totalPages = data.total_pages;
      resultsCountText.textContent = `تم العثور على ${Number(data.total).toLocaleString('ar-EG')} مستند مطابق للمعايير`;

      // تحديث ترقيم الصفحات
      if (data.total > state.limit) {
        paginationBar.style.display = "flex";
        paginationInfo.textContent = `صفحة ${state.page} من ${data.total_pages}`;
        btnPrevPage.disabled = state.page <= 1;
        btnNextPage.disabled = state.page >= data.total_pages;
      } else {
        paginationBar.style.display = "none";
      }

      if (data.items.length === 0) {
        documentsContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; background: #18233e; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.15);">
            <i class="fa-solid fa-folder-open fa-3x" style="color: #64748b; margin-bottom: 14px;"></i>
            <h4 style="color: #fff; margin-bottom: 8px;">لا توجد مستندات تطابق هذا البحث</h4>
            <p style="color: #94a3b8; font-size: 13.5px; margin-bottom: 20px;">جرّب تعديل كلمات البحث، أو اضغط زر "سحب دفعة (1000 ورقة)" لإدخال حزمة فواتير كاملة وتجربتها فوراً.</p>
            <button class="btn btn-emerald" onclick="document.getElementById('btnGen1000').click()">
              <i class="fa-solid fa-bolt"></i> سحب 1000 ورقة الآن
            </button>
          </div>
        `;
        return;
      }

      documentsContainer.innerHTML = data.items.map(doc => renderDocCard(doc)).join("");

      // إضافة أحداث النقر للبطاقات
      document.querySelectorAll(".doc-card").forEach(card => {
        card.addEventListener("click", () => {
          const docId = card.getAttribute("data-id");
          openDocModal(docId);
        });
      });

      // ملء قائمة المناديب ديناميكياً إن لم تكن ممتلئة
      populateDelegatesList(data.items);

    } catch (err) {
      console.error("Documents load error:", err);
      documentsContainer.innerHTML = `<div style="grid-column: 1/-1; color: #f43f5e; text-align: center; padding: 40px;">حدث خطأ في تحميل الأرشيف</div>`;
    }
  }

  function renderDocCard(doc) {
    const thumbUrl = `/storage/${doc.thumbnail_path}`;
    const formattedAmount = `${Number(doc.amount).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`;

    const sigBadge = doc.has_signature == 1
      ? `<span class="mini-badge badge-signed" title="${doc.signature_info || 'موقع بإمضاء معتمد'}"><i class="fa-solid fa-signature"></i> موقّع</span>`
      : `<span class="mini-badge badge-unsigned" title="بدون إمضاء"><i class="fa-solid fa-triangle-exclamation"></i> غير موقّع</span>`;

    const hwBadge = doc.has_handwriting == 1
      ? `<span class="mini-badge badge-hw" title="${doc.handwritten_notes || 'به كتابة يد للمندوب'}"><i class="fa-solid fa-pen-nib"></i> كتابة مندوب</span>`
      : ``;

    const markBadge = doc.has_special_marks == 1
      ? `<span class="mini-badge badge-mark" title="${doc.special_marks || 'به علامة مميزة أو ختم'}"><i class="fa-solid fa-stamp"></i> علامة مميزة</span>`
      : ``;

    const copierBadge = `<span class="mini-badge" style="background: rgba(59, 130, 246, 0.12); color: #93c5fd; border: 1px solid rgba(59,130,246,0.25);" title="سحب بواسطة: ${doc.copier_name || 'ماكينة الشبكة'}"><i class="fa-solid fa-print"></i> ${doc.copier_name ? doc.copier_name.split('(')[0] : 'ماكينة ريكو'}</span>`;

    const isSelected = state.selectedDocIds.has(doc.id);

    return `
      <div class="doc-card ${isSelected ? 'doc-card-selected' : ''}" data-id="${doc.id}">
        <!-- صندوق تحديد الورقة -->
        <input type="checkbox" class="doc-card-select-check" data-id="${doc.id}" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); window.toggleDocSelection(${doc.id});" title="تحديد هذه الورقة">
        <div class="doc-card-thumb-wrapper">
          <img src="${thumbUrl}" alt="${doc.doc_number}" class="doc-card-thumb" loading="lazy" onerror="this.src='/static/style.css'">
          <span class="doc-type-badge">${doc.doc_type || 'مستند مالي'}</span>
          <span class="doc-amount-badge">${formattedAmount}</span>
        </div>
        <div class="doc-card-body">
          <div class="doc-card-header-info">
            <span class="doc-card-number">${doc.doc_number}</span>
            <span>${doc.doc_date}</span>
          </div>
          <h4 class="doc-card-party" title="${doc.party_name}">${doc.party_name || 'جهة غير محددة'}</h4>
          <div class="doc-card-delegate">
            <i class="fa-solid fa-user-tag"></i>
            <span>المندوب: ${doc.delegate_name || 'غير محدد'}</span>
          </div>
          <div class="doc-tags-list">
            ${copierBadge}
            ${sigBadge}
            ${hwBadge}
            ${markBadge}
          </div>
        </div>
      </div>
    `;
  }

  function populateDelegatesList(items) {
    const existing = new Set();
    for (let i = 1; i < filterDelegate.options.length; i++) {
      existing.add(filterDelegate.options[i].value);
    }
    items.forEach(doc => {
      if (doc.delegate_name && !existing.has(doc.delegate_name)) {
        existing.add(doc.delegate_name);
        const opt = document.createElement("option");
        opt.value = doc.delegate_name;
        opt.textContent = doc.delegate_name;
        filterDelegate.appendChild(opt);
      }
    });
  }

  // --- نافذة معاينة المستند المالي عالية الدقة ---
  async function openDocModal(docId) {
    try {
      const res = await fetch(`/api/documents/${docId}`);
      if (!res.ok) return;
      const doc = await res.json();
      state.currentDoc = doc;
      state.zoomLevel = 1;
      state.rotation = 0;

      modalDocTitle.textContent = doc.doc_type || "مستند مالي";
      modalDocNumber.textContent = doc.doc_number;
      modalDocPhysicalBox.textContent = doc.batch_info?.physical_box || "صندوق أرشيف #1";
      modalDocAmount.textContent = `${Number(doc.amount).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`;
      modalDocDate.textContent = doc.doc_date;
      modalDocParty.textContent = doc.party_name || "جهة غير محددة";
      modalDocDelegate.textContent = doc.delegate_name || "غير محدد";

      if (modalDocVehicle) {
        modalDocVehicle.textContent = doc.vehicle_code ? `${doc.vehicle_code} (${doc.delegate_name || 'سيارة التوزيع'})` : "غير محدد";
      }
      if (modalDocVehicleCode) {
        if (doc.vehicle_code) {
          modalDocVehicleCode.textContent = `سيارة: ${doc.vehicle_code}`;
          modalDocVehicleCode.style.display = "inline-flex";
        } else {
          modalDocVehicleCode.style.display = "none";
        }
      }

      // تنظيف كشف الصورة والعدسة السابقة
      clearInDocSearchUI();
      initMagnifierForCurrentDoc();

      // الصورة
      modalDocImage.src = `/storage/${doc.file_path}`;
      updateImageTransform();

      // فحص الإمضاء
      if (doc.has_signature == 1) {
        badgeModalSigStatus.className = "badge badge-success";
        badgeModalSigStatus.textContent = "موقع ومعتمد";
        modalSigText.innerHTML = `<strong>تفاصيل الإمضاء:</strong> ${doc.signature_info || 'تم كشف توقيع معتمد للمندوب واستلام العميل'}`;
      } else {
        badgeModalSigStatus.className = "badge badge-warning";
        badgeModalSigStatus.textContent = "غير موقع";
        modalSigText.innerHTML = `<strong>تنبيه:</strong> الورقة لا تحتوي على توقيع مكتشف - يرجى استيفاء التوقيع.`;
      }

      // كتابة المندوب
      if (doc.has_handwriting == 1) {
        badgeModalHwStatus.className = "badge badge-info";
        badgeModalHwStatus.textContent = "توجد كتابة يد";
        modalHwText.innerHTML = `<strong>ملاحظات المندوب المفرغة:</strong> ${doc.handwritten_notes}`;
      } else {
        badgeModalHwStatus.className = "badge badge-outline";
        badgeModalHwStatus.textContent = "لا توجد كتابة";
        modalHwText.textContent = "لم يتم رصد كتابات هامشية بخط اليد على هذا المستند.";
      }

      // العلامات والأختام
      if (doc.has_special_marks == 1) {
        badgeModalMarksStatus.className = "badge badge-warning";
        badgeModalMarksStatus.textContent = "علامة مميزة / ختم";
        modalMarksText.innerHTML = `<strong>العلامة المرصودة:</strong> ${doc.special_marks}`;
      } else {
        badgeModalMarksStatus.className = "badge badge-outline";
        badgeModalMarksStatus.textContent = "بدون علامات";
        modalMarksText.textContent = "لا توجد أختام أو علامات مميزة مرصودة.";
      }

      // الأرشيف الورقي
      modalPhysicalLocation.textContent = `${doc.batch_info?.physical_box || 'صندوق الأرشيف الرئيسي'} (الورقة رقم ${doc.page_number} في الملف)`;

      docModal.style.display = "flex";
    } catch (err) {
      console.error("Modal load error:", err);
    }
  }

  function updateImageTransform() {
    modalDocImage.style.transform = `scale(${state.zoomLevel}) rotate(${state.rotation}deg)`;
  }

  btnZoomIn.addEventListener("click", () => {
    state.zoomLevel = Math.min(3, state.zoomLevel + 0.25);
    updateImageTransform();
  });

  btnZoomOut.addEventListener("click", () => {
    state.zoomLevel = Math.max(0.5, state.zoomLevel - 0.25);
    updateImageTransform();
  });

  btnRotate.addEventListener("click", () => {
    state.rotation = (state.rotation + 90) % 360;
    updateImageTransform();
  });

  btnOpenNewTab.addEventListener("click", () => {
    if (state.currentDoc) {
      window.open(`/storage/${state.currentDoc.file_path}`, "_blank");
    }
  });

  btnCloseModal.addEventListener("click", () => {
    docModal.style.display = "none";
  });

  // تنزيل المستند المالي كملف PDF
  btnDownloadDocPdf.addEventListener("click", () => {
    if (!state.currentDoc) return;
    window.open(`/api/documents/${state.currentDoc.id}/pdf`, "_blank");
  });

  // طباعة الورقة المالية مباشرة
  btnPrintDoc.addEventListener("click", () => {
    if (!state.currentDoc) return;
    const doc = state.currentDoc;
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    printWindow.document.write(`
      <html dir="rtl" lang="ar">
      <head>
        <title>طباعة: ${doc.doc_type} - ${doc.doc_number}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 20px; color: #111; }
          .print-header { border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
          .print-title { font-size: 20px; font-weight: bold; }
          .print-meta { font-size: 13px; color: #555; }
          .print-img { max-width: 100%; border: 1px solid #ccc; margin-top: 15px; }
          .print-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px; margin-bottom: 15px; }
          .print-box { background: #f9f9f9; padding: 8px 12px; border: 1px solid #eee; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div>
            <div class="print-title">خلدون للأرشيف المالي | Khaldoun Financial Archive</div>
            <div class="print-meta">${doc.doc_type} رقم: <strong>${doc.doc_number}</strong> | التاريخ: ${doc.doc_date}</div>
          </div>
          <div class="print-meta">
            مكان الحفظ الورقي: ${doc.batch_info?.physical_box || 'صندوق الأرشيف'}
          </div>
        </div>
        <div class="print-info-grid">
          <div class="print-box">العميل / الطرف: <strong>${doc.party_name || 'غير محدد'}</strong></div>
          <div class="print-box">المبلغ المالي: <strong>${Number(doc.amount).toLocaleString('ar-EG')} ج.م</strong></div>
          <div class="print-box">المندوب: <strong>${doc.delegate_name || 'غير محدد'}</strong></div>
          <div class="print-box">الإمضاء: <strong>${doc.has_signature ? 'موقّع ومعتمد' : 'غير موقّع'}</strong> (${doc.signature_info || ''})</div>
        </div>
        ${doc.handwritten_notes ? `<div class="print-box" style="margin-bottom: 15px;"><strong>ملاحظات المندوب بخط اليد:</strong> ${doc.handwritten_notes}</div>` : ''}
        <img class="print-img" src="/storage/${doc.file_path}" alt="صورة المستند">
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  });

  // حذف هذا المستند مفرد من داخل المعاينة
  btnDeleteSingleDoc.addEventListener("click", async () => {
    if (!state.currentDoc) return;
    const confirmed = confirm(`هل تريد بالتأكيد حذف المستند (${state.currentDoc.doc_number}) وإزالته نهائياً من الأرشيف والقرص؟`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/documents/${state.currentDoc.id}`, { method: "DELETE" });
      const data = await res.json();
      alert(data.message || "تم حذف المستند بنجاح");
      docModal.style.display = "none";
      loadStats();
      loadDocuments();
    } catch (err) {
      alert("حدث خطأ أثناء حذف المستند");
    }
  });

  // ==========================================================================
  // [1] عدسة التكبير والتصغير التفاعلية (Interactive Optical Magnifier Lens)
  // ==========================================================================
  let isMagnifierEnabled = true;
  let magnifierPower = 3;

  function initMagnifierForCurrentDoc() {
    if (imageMagnifierLens) imageMagnifierLens.style.display = "none";
    if (magnifierBtnLabel) {
      magnifierBtnLabel.textContent = isMagnifierEnabled ? "عدسة التكبير (مفعلة)" : "عدسة التكبير (متوقفة)";
    }
    if (btnToggleMagnifier) {
      if (isMagnifierEnabled) btnToggleMagnifier.classList.add("active");
      else btnToggleMagnifier.classList.remove("active");
    }
  }

  if (btnToggleMagnifier) {
    btnToggleMagnifier.addEventListener("click", () => {
      isMagnifierEnabled = !isMagnifierEnabled;
      initMagnifierForCurrentDoc();
    });
  }

  if (selectMagnifierPower) {
    selectMagnifierPower.addEventListener("change", () => {
      magnifierPower = parseFloat(selectMagnifierPower.value) || 3;
    });
  }

  // تتبع حركة الفأرة لتحريك عدسة التكبير المجهرية فوق الورقة
  if (docImageContainer && modalDocImage && imageMagnifierLens) {
    docImageContainer.addEventListener("mousemove", (e) => {
      if (!isMagnifierEnabled || !state.currentDoc) {
        imageMagnifierLens.style.display = "none";
        return;
      }
      const rect = modalDocImage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        imageMagnifierLens.style.display = "none";
        return;
      }

      imageMagnifierLens.style.display = "block";
      const lensWidth = imageMagnifierLens.offsetWidth || 200;
      const lensHeight = imageMagnifierLens.offsetHeight || 200;
      const halfW = lensWidth / 2;
      const halfH = lensHeight / 2;

      const containerRect = docImageContainer.getBoundingClientRect();
      const posX = e.clientX - containerRect.left - halfW;
      const posY = e.clientY - containerRect.top - halfH;

      imageMagnifierLens.style.left = `${posX}px`;
      imageMagnifierLens.style.top = `${posY}px`;

      imageMagnifierLens.style.backgroundImage = `url("${modalDocImage.src}")`;
      imageMagnifierLens.style.backgroundSize = `${rect.width * magnifierPower}px ${rect.height * magnifierPower}px`;
      const bgX = -((x * magnifierPower) - halfW);
      const bgY = -((y * magnifierPower) - halfH);
      imageMagnifierLens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    });

    docImageContainer.addEventListener("mouseleave", () => {
      if (imageMagnifierLens) imageMagnifierLens.style.display = "none";
    });
  }

  // ==========================================================================
  // [2] البحث المتطور في صورة الورقة المفتوحة وكشف المناطق (In-Image Deep Search)
  // ==========================================================================
  async function executeInDocSearch() {
    if (!state.currentDoc) return;
    const q = inDocSearchInput.value.trim();
    if (!q) {
      alert("يرجى كتابة نص أو إمضاء أو علامة للبحث عنها داخل صورة الورقة");
      return;
    }

    try {
      btnInDocSearch.disabled = true;
      btnInDocSearch.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص الصورة...`;

      const res = await fetch(`/api/documents/${state.currentDoc.id}/in-image-search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("تعذر إتمام الكشف البصري في الصورة");
      const data = await res.json();

      renderInDocMatches(data.matches || [], q);
    } catch (e) {
      alert("حدث خطأ أثناء فحص صورة الورقة: " + e.message);
    } finally {
      btnInDocSearch.disabled = false;
      btnInDocSearch.innerHTML = `<i class="fa-solid fa-crosshairs"></i> <span>كشف داخل الصورة</span>`;
    }
  }

  function renderInDocMatches(matches, query) {
    if (!docHighlightOverlay) return;
    docHighlightOverlay.innerHTML = "";

    if (!matches || matches.length === 0) {
      inDocMatchBadge.style.display = "inline-flex";
      inDocMatchBadge.className = "badge badge-warning";
      inDocMatchBadge.textContent = "0 تطابق في الصورة";
      btnClearInDocSearch.style.display = "inline-flex";
      if (cardInDocMatches) cardInDocMatches.style.display = "none";
      alert(`لم يتم العثور على أي كتابة أو إمضاء أو بند مطابق لـ "${query}" داخل صورة هذه الورقة.`);
      return;
    }

    inDocMatchBadge.style.display = "inline-flex";
    inDocMatchBadge.className = "badge badge-emerald";
    inDocMatchBadge.textContent = `${matches.length} تطابق في الصورة`;
    btnClearInDocSearch.style.display = "inline-flex";

    // رسم صناديق التحديد البصري فوق الصورة
    matches.forEach((m, idx) => {
      const box = document.createElement("div");
      box.className = `doc-highlight-box type-${m.type || 'content'}`;
      box.style.top = m.rect.top;
      box.style.left = m.rect.left;
      box.style.width = m.rect.width;
      box.style.height = m.rect.height;
      box.title = `${m.label}: ${m.snippet}`;

      const tag = document.createElement("span");
      tag.className = "box-tag-chip";
      tag.textContent = m.label;
      box.appendChild(tag);

      box.addEventListener("click", (ev) => {
        ev.stopPropagation();
        focusOnHighlightBox(box);
      });

      docHighlightOverlay.appendChild(box);
    });

    // ملء بطاقة المناطق في الشريط الجانبي للورقة
    if (cardInDocMatches && inDocMatchesList) {
      cardInDocMatches.style.display = "block";
      badgeMatchCount.textContent = `${matches.length} مناطق`;
      inDocMatchesList.innerHTML = matches.map((m, i) => `
        <div class="match-item-card" data-idx="${i}">
          <div class="match-item-title">${m.label}</div>
          <div class="match-item-snippet">${m.snippet}</div>
        </div>
      `).join("");

      inDocMatchesList.querySelectorAll(".match-item-card").forEach((item, idx) => {
        item.addEventListener("click", () => {
          const boxes = docHighlightOverlay.querySelectorAll(".doc-highlight-box");
          if (boxes[idx]) focusOnHighlightBox(boxes[idx]);
        });
      });
    }
  }

  function focusOnHighlightBox(element) {
    if (docImageContainer && element) {
      // تمرير سلس فقط داخل حاوية الصورة دون إزاحة النافذة بالكامل
      const containerRect = docImageContainer.getBoundingClientRect();
      const elemRect = element.getBoundingClientRect();
      if (elemRect.top < containerRect.top || elemRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    }
    element.style.borderColor = "#fff";
    element.style.boxShadow = "0 0 25px #10b981";
    setTimeout(() => {
      element.style.borderColor = "";
      element.style.boxShadow = "";
    }, 2200);
  }

  function clearInDocSearchUI() {
    if (docHighlightOverlay) docHighlightOverlay.innerHTML = "";
    if (inDocSearchInput) inDocSearchInput.value = "";
    if (inDocMatchBadge) inDocMatchBadge.style.display = "none";
    if (btnClearInDocSearch) btnClearInDocSearch.style.display = "none";
    if (cardInDocMatches) cardInDocMatches.style.display = "none";
  }

  if (btnInDocSearch) btnInDocSearch.addEventListener("click", executeInDocSearch);
  if (inDocSearchInput) {
    inDocSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        executeInDocSearch();
      }
    });
  }
  if (btnClearInDocSearch) btnClearInDocSearch.addEventListener("click", clearInDocSearchUI);

  // ==========================================================================
  // [3] إدارة أسطول العربيات وتصفير المناديب (Vehicles Fleet & Reset Delegates)
  // ==========================================================================
  let vehiclesData = [];

  async function loadVehicles() {
    try {
      const res = await fetch("/api/vehicles");
      if (!res.ok) return;
      vehiclesData = await res.json();
      renderVehiclesGrid(vehiclesData);
      populateVehicleDropdowns(vehiclesData);
    } catch (e) {
      console.error("Vehicles load error:", e);
    }
  }

  function renderVehiclesGrid(list) {
    if (!vehiclesGridContainer) return;
    if (fleetVehicleCountBadge) fleetVehicleCountBadge.textContent = `${list.length} عربيات`;
    if (fleetActiveCount) fleetActiveCount.textContent = list.filter(v => v.status === "active").length;

    let totalInvs = 0;
    list.forEach(v => totalInvs += (v.doc_count || 0));
    if (fleetTotalInvoices) fleetTotalInvoices.textContent = totalInvs;

    if (list.length === 0) {
      vehiclesGridContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">لا توجد سيارات مسجلة حالياً. استخدم زر "إضافة سيارة جديدة" أو "تصفير الأسطول".</div>`;
      return;
    }

    vehiclesGridContainer.innerHTML = list.map(v => `
      <div class="vehicle-card">
        <div class="vehicle-card-header">
          <span class="vehicle-code-badge"><i class="fa-solid fa-truck"></i> ${v.vehicle_code}</span>
          <span class="badge ${v.status === 'active' ? 'badge-success' : 'badge-warning'}">${v.status === 'active' ? 'نشطة في التوزيع' : 'تحت الصيانة'}</span>
        </div>
        <div class="vehicle-card-details">
          <div class="v-row"><span class="v-lbl">الموديل والنوع:</span><span class="v-val">${v.model || 'غير محدد'}</span></div>
          <div class="v-row"><span class="v-lbl">رقم اللوحة:</span><span class="v-val">${v.plate_number || 'بدون لوحة'}</span></div>
          <div class="v-row"><span class="v-lbl">المندوب المعتمد:</span><span class="v-val">${v.driver_name || 'غير محدد'}</span></div>
          <div class="v-row"><span class="v-lbl">رقم الهاتف:</span><span class="v-val">${v.driver_phone || 'لا يوجد'}</span></div>
          <div class="v-row"><span class="v-lbl">الحمولة:</span><span class="v-val">${v.capacity_tons || 4} طن</span></div>
          <div class="v-row"><span class="v-lbl">المستودع المصدر:</span><span class="v-val">${v.assigned_warehouse || 'المستودع الرئيسي'}</span></div>
        </div>
        <div class="vehicle-card-footer">
          <div>
            <strong style="color: #38bdf8; font-size: 14px;">${v.doc_count || 0}</strong> <span style="font-size: 11.5px; color: #94a3b8;">فواتير مسحوبة</span>
          </div>
          <button class="btn btn-sm btn-primary btn-open-vehicle-dossier" data-code="${v.vehicle_code}">
            <i class="fa-solid fa-folder-open"></i> فتح ملف العربية
          </button>
        </div>
      </div>
    `).join("");

    // ربط أزرار فتح ملف العربية
    vehiclesGridContainer.querySelectorAll(".btn-open-vehicle-dossier").forEach(btn => {
      btn.addEventListener("click", () => {
        const code = btn.getAttribute("data-code");
        openVehicleDossier(code);
      });
    });
  }

  function populateVehicleDropdowns(list) {
    if (transVehicleCode) {
      transVehicleCode.innerHTML = `<option value="">بدون سيارة (صرف/إضافة عامة)</option>` +
        list.map(v => `<option value="${v.vehicle_code}">${v.vehicle_code} - ${v.driver_name || v.model}</option>`).join("");
    }
  }

  // فلترة وبحث العربيات
  if (searchVehiclesInput) {
    searchVehiclesInput.addEventListener("input", () => {
      const q = searchVehiclesInput.value.trim().toLowerCase();
      if (!q) {
        renderVehiclesGrid(vehiclesData);
        return;
      }
      const filtered = vehiclesData.filter(v =>
        (v.vehicle_code && v.vehicle_code.toLowerCase().includes(q)) ||
        (v.model && v.model.toLowerCase().includes(q)) ||
        (v.plate_number && v.plate_number.toLowerCase().includes(q)) ||
        (v.driver_name && v.driver_name.toLowerCase().includes(q))
      );
      renderVehiclesGrid(filtered);
    });
  }

  // فتح وإغلاق مودال أسطول العربيات
  if (btnOpenVehiclesHub) {
    btnOpenVehiclesHub.addEventListener("click", () => {
      loadVehicles();
      vehiclesDossierModal.style.display = "flex";
    });
  }
  if (btnCloseVehiclesModal) {
    btnCloseVehiclesModal.addEventListener("click", () => {
      vehiclesDossierModal.style.display = "none";
    });
  }

  // حذف جميع المناديب واعتماد أسطول جديد مع أكواد العربيات
  if (btnWipeOldDelegates) {
    btnWipeOldDelegates.addEventListener("click", async () => {
      const confirmWipe = confirm(
        "⚠️ تحذير حاسم ومؤكد:\n\n" +
        "هل أنت متأكد من رغبتك في حذف وتصفير جميع المناديب القديمة نهائياً،\n" +
        "واعتماد قائمة المناديب الجدد مع أكواد سياراتهم التوزيعية (VH-101 إلى VH-105)؟\n\n" +
        "سيتم تحديث سجلات الأرشيف ومطابقة الفواتير مع المناديب والسيارات الجديدة."
      );
      if (!confirmWipe) return;

      try {
        btnWipeOldDelegates.disabled = true;
        btnWipeOldDelegates.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري التصفير والاعتماد...`;

        const res = await fetch("/api/delegates/wipe-and-reset", { method: "POST" });
        const data = await res.json();
        alert("✅ " + (data.message || "تم حذف جميع المناديب القديمة واعتماد المناديب الجدد مع أكواد عربياتهم بنجاح!"));

        loadVehicles();
        loadDocuments();
        loadStats();
      } catch (e) {
        alert("حدث خطأ أثناء تصفير المناديب: " + e.message);
      } finally {
        btnWipeOldDelegates.disabled = false;
        btnWipeOldDelegates.innerHTML = `<i class="fa-solid fa-user-xmark"></i> <span>حذف القديم وتصفير الأسطول</span>`;
      }
    });
  }

  // إضافة سيارة جديدة
  if (btnToggleAddVehicle) {
    btnToggleAddVehicle.addEventListener("click", () => {
      if (addVehicleFormCard) {
        addVehicleFormCard.style.display = addVehicleFormCard.style.display === "none" ? "block" : "none";
      }
    });
  }
  if (btnCancelAddVehicle) {
    btnCancelAddVehicle.addEventListener("click", () => {
      if (addVehicleFormCard) addVehicleFormCard.style.display = "none";
    });
  }
  if (btnSaveNewVehicle) {
    btnSaveNewVehicle.addEventListener("click", async () => {
      const code = document.getElementById("newVehCode").value.trim().toUpperCase();
      const model = document.getElementById("newVehModel").value.trim();
      const plate = document.getElementById("newVehPlate").value.trim();
      const driver = document.getElementById("newVehDriver").value.trim();
      const phone = document.getElementById("newVehPhone").value.trim();
      const capacity = parseFloat(document.getElementById("newVehCapacity").value) || 4.0;

      if (!code || !model || !plate) {
        alert("يرجى ملء كود السيارة والموديل ورقم اللوحة المعدنية");
        return;
      }

      try {
        const payload = {
          vehicle_code: code,
          model: model,
          plate_number: plate,
          driver_name: driver,
          driver_phone: phone,
          capacity_tons: capacity,
          status: "active"
        };
        const res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || "تم تسجيل السيارة بنجاح");
        if (addVehicleFormCard) addVehicleFormCard.style.display = "none";
        loadVehicles();
      } catch (e) {
        alert("حدث خطأ أثناء حفظ السيارة: " + e.message);
      }
    });
  }

  // ==========================================================================
  // [4] الملف الشامل للسيارة والكود بتاعها (Single Vehicle Dossier)
  // ==========================================================================
  let currentDossierData = null;

  async function openVehicleDossier(vehicleCode) {
    try {
      const res = await fetch(`/api/vehicles/${vehicleCode}/dossier`);
      if (!res.ok) throw new Error("تعذر جلب ملف السيارة");
      const data = await res.json();
      currentDossierData = data;

      const v = data.vehicle;
      const stats = data.stats;

      // العناوين وبيانات السيارة
      document.getElementById("dossierVehCode").textContent = v.vehicle_code;
      document.getElementById("dossierVehModel").textContent = v.model || "سيارة توزيع";
      document.getElementById("dossierCodeVal").textContent = v.vehicle_code;
      document.getElementById("dossierPlateVal").textContent = v.plate_number;
      document.getElementById("dossierDriverVal").textContent = v.driver_name || "غير محدد";
      document.getElementById("dossierPhoneVal").textContent = v.driver_phone || "لا يوجد";
      document.getElementById("dossierCapacityVal").textContent = `${v.capacity_tons || 4} طن`;
      document.getElementById("dossierStatusVal").textContent = v.status === "active" ? "نشطة في التوزيع" : "صيانة";

      // مؤشرات الأداء المالي والمخزني
      document.getElementById("dossierKpiTotalInvoices").textContent = `${stats.total_invoices} ورقة`;
      document.getElementById("dossierKpiTotalSales").textContent = `${Number(stats.total_sales).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`;
      document.getElementById("dossierKpiStockTransfers").textContent = `${stats.total_stock_transfers} أذون مخزن`;
      document.getElementById("dossierKpiSignedRatio").textContent = `${stats.signed_ratio}%`;

      document.getElementById("dossierInvoicesTabCount").textContent = data.invoices.length;
      document.getElementById("dossierInventoryTabCount").textContent = data.stock_transfers.length;

      // ملء جدول الفواتير
      const invBody = document.getElementById("dossierInvoicesTableBody");
      if (data.invoices.length === 0) {
        invBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:24px;">لا توجد فواتير مسحوبة ومسجلة على كود هذه السيارة حتى الآن.</td></tr>`;
      } else {
        invBody.innerHTML = data.invoices.map(inv => `
          <tr>
            <td><strong>${inv.doc_number}</strong></td>
            <td>${inv.doc_date}</td>
            <td>${inv.party_name || 'غير محدد'}</td>
            <td><strong style="color: #10b981;">${Number(inv.amount).toLocaleString('ar-EG')} ج.م</strong></td>
            <td>${inv.has_signature == 1 ? '<span class="badge badge-success"><i class="fa-solid fa-signature"></i> موقع</span>' : '<span class="badge badge-warning">بدون توقيع</span>'}</td>
            <td>${inv.handwritten_notes || '<span style="color:#64748b;">-</span>'}</td>
            <td><span class="badge badge-outline">${inv.physical_box || 'صندوق #1'}</span></td>
            <td>
              <button class="btn btn-sm btn-outline btn-dossier-view-doc" data-id="${inv.id}" title="معاينة الورقة">
                <i class="fa-solid fa-eye"></i> معاينة
              </button>
            </td>
          </tr>
        `).join("");

        invBody.querySelectorAll(".btn-dossier-view-doc").forEach(btn => {
          btn.addEventListener("click", () => {
            const docId = btn.getAttribute("data-id");
            openDocModal(docId);
          });
        });
      }

      // ملء جدول بضاعة المخزون للسيارة
      const stockBody = document.getElementById("dossierInventoryTableBody");
      if (data.stock_transfers.length === 0) {
        stockBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:24px;">لا توجد أذون بضاعة محولة لهذه السيارة من المخزن حالياً.</td></tr>`;
      } else {
        stockBody.innerHTML = data.stock_transfers.map(tr => `
          <tr>
            <td><strong>${tr.reference_no || ('TR-' + tr.id)}</strong></td>
            <td>${(tr.created_at || '').substring(0, 16)}</td>
            <td><code>${tr.item_code}</code></td>
            <td><strong>${tr.item_name}</strong></td>
            <td><strong style="color: #38bdf8;">${tr.quantity}</strong></td>
            <td>${tr.unit || 'كرتونة'}</td>
            <td>${tr.warehouse || 'المستودع الرئيسي'}</td>
            <td>${tr.notes || '-'}</td>
          </tr>
        `).join("");
      }

      singleVehicleDossierModal.style.display = "flex";
    } catch (e) {
      alert("حدث خطأ أثناء فتح ملف السيارة: " + e.message);
    }
  }

  if (btnCloseSingleVehicleModal) {
    btnCloseSingleVehicleModal.addEventListener("click", () => {
      singleVehicleDossierModal.style.display = "none";
    });
  }

  // تبويبات ملف السيارة
  document.querySelectorAll(".dossier-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dossier-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-dossier-tab");
      document.getElementById("dossierPaneInvoices").style.display = target === "invoices" ? "block" : "none";
      document.getElementById("dossierPaneInventory").style.display = target === "inventory" ? "block" : "none";
    });
  });

  // طباعة ملف السيارة الشامل
  if (btnPrintVehicleDossier) {
    btnPrintVehicleDossier.addEventListener("click", () => {
      if (!currentDossierData) return;
      const v = currentDossierData.vehicle;
      const s = currentDossierData.stats;
      const printWindow = window.open("", "_blank", "width=900,height=1100");
      printWindow.document.write(`
        <html dir="rtl" lang="ar">
        <head>
          <title>ملف سيارة: ${v.vehicle_code} - ${v.driver_name}</title>
          <style>
            body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 25px; color: #111; }
            .header { border-bottom: 3px solid #111; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 22px; font-weight: bold; }
            .meta { font-size: 13px; color: #555; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
            .card { background: #f4f4f4; padding: 12px; border: 1px solid #ddd; border-radius: 4px; }
            .card label { font-size: 11px; color: #666; display: block; }
            .card strong { font-size: 16px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: right; }
            th { background: #eee; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">خلدون للأرشيف المالي | تقرير ملف سيارة التوزيع</div>
              <div class="meta">كود السيارة: <strong>${v.vehicle_code}</strong> | السائق: <strong>${v.driver_name}</strong> | لوحة: <strong>${v.plate_number}</strong></div>
            </div>
            <div class="meta">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')}</div>
          </div>
          <div class="grid">
            <div class="card"><label>إجمالي الفواتير المسحوبة</label><strong>${s.total_invoices} ورقة</strong></div>
            <div class="card"><label>إجمالي المبيعات المحصلة</label><strong>${Number(s.total_sales).toLocaleString('ar-EG')} ج.م</strong></div>
            <div class="card"><label>نسبة الفواتير الموقعة</label><strong>${s.signed_ratio}%</strong></div>
          </div>
          <h3>أرشيف فواتير السيارة:</h3>
          <table>
            <thead>
              <tr><th>رقم الفاتورة</th><th>التاريخ</th><th>العميل</th><th>المبلغ</th><th>التوقيع</th><th>كتابة المندوب</th></tr>
            </thead>
            <tbody>
              ${currentDossierData.invoices.map(inv => `
                <tr>
                  <td>${inv.doc_number}</td>
                  <td>${inv.doc_date}</td>
                  <td>${inv.party_name || '-'}</td>
                  <td>${Number(inv.amount).toLocaleString('ar-EG')} ج.م</td>
                  <td>${inv.has_signature == 1 ? 'موقّع' : 'غير موقّع'}</td>
                  <td>${inv.handwritten_notes || '-'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    });
  }

  // تصدير تقرير العربية كملف CSV
  if (btnExportVehicleDossier) {
    btnExportVehicleDossier.addEventListener("click", () => {
      if (!currentDossierData) return;
      const v = currentDossierData.vehicle;
      let csv = "\uFEFFرقم الفاتورة,التاريخ,العميل,المبلغ المالي,كود السيارة,المندوب,حالة التوقيع,ملاحظات المندوب\n";
      currentDossierData.invoices.forEach(inv => {
        csv += `"${inv.doc_number}","${inv.doc_date}","${inv.party_name || ''}",${inv.amount},"${v.vehicle_code}","${v.driver_name}","${inv.has_signature == 1 ? 'موقع' : 'غير موقع'}","${inv.handwritten_notes || ''}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `تقرير_سيارة_${v.vehicle_code}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // ==========================================================================
  // [5] إدارة ومراقبة المخزون المستودعي (Inventory Control Hub)
  // ==========================================================================
  async function loadInventory() {
    try {
      // إحصائيات المخزون
      const statsRes = await fetch("/api/inventory/stats");
      if (statsRes.ok) {
        const stats = await statsRes.json();
        if (invStatTotalItems) invStatTotalItems.textContent = stats.total_items;
        if (invStatTotalValue) invStatTotalValue.textContent = `${Number(stats.total_inventory_value).toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`;
        if (invStatLowStock) invStatLowStock.textContent = stats.low_stock_items;
        if (invStatVehicleTransfers) invStatVehicleTransfers.textContent = stats.vehicle_transfers;
      }

      // قائمة الأصناف
      const itemsRes = await fetch("/api/inventory/items");
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        renderInventoryItems(items);
        populateItemSelect(items);
      }

      // سجل الحركات
      const transRes = await fetch("/api/inventory/transactions");
      if (transRes.ok) {
        const trans = await transRes.json();
        renderInventoryTransactions(trans);
      }
    } catch (e) {
      console.error("Inventory load error:", e);
    }
  }

  function renderInventoryItems(items) {
    if (!inventoryItemsTableBody) return;
    if (items.length === 0) {
      inventoryItemsTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:#94a3b8; padding:24px;">لا توجد أصناف في المخزن حالياً.</td></tr>`;
      return;
    }

    inventoryItemsTableBody.innerHTML = items.map(it => {
      const isLow = it.quantity <= it.min_quantity;
      const meterPercent = Math.min(100, Math.round((it.quantity / (it.min_quantity * 2.5 || 50)) * 100));
      const statusClass = it.quantity <= 0 ? 'danger' : (isLow ? 'warning' : 'normal');
      const statusText = it.quantity <= 0 ? 'نافد تماماً' : (isLow ? 'تنبيه: أوشك على النفاد' : 'رصيد كافي وآمن');

      return `
        <tr>
          <td><code>${it.item_code}</code></td>
          <td><strong>${it.item_name}</strong></td>
          <td><span class="badge badge-outline">${it.category || 'عام'}</span></td>
          <td><strong style="color: ${isLow ? '#f43f5e' : '#10b981'}; font-size:14px;">${it.quantity} ${it.unit}</strong></td>
          <td>${it.min_quantity} ${it.unit}</td>
          <td>
            <div class="stock-meter-wrap">
              <span class="badge ${isLow ? 'badge-rose' : 'badge-success'}">${statusText}</span>
              <div class="stock-meter-bar">
                <div class="stock-meter-fill ${statusClass}" style="width: ${meterPercent}%;"></div>
              </div>
            </div>
          </td>
          <td>${Number(it.unit_price).toLocaleString('ar-EG')} ج.م</td>
          <td><strong>${Number(it.quantity * it.unit_price).toLocaleString('ar-EG')} ج.م</strong></td>
          <td>${it.warehouse || 'المستودع الرئيسي'}</td>
        </tr>
      `;
    }).join("");
  }

  function populateItemSelect(items) {
    if (!transItemSelect) return;
    transItemSelect.innerHTML = items.map(it => `
      <option value="${it.id}">${it.item_code} - ${it.item_name} (رصيد المخزن: ${it.quantity} ${it.unit})</option>
    `).join("");
  }

  function renderInventoryTransactions(trans) {
    if (!inventoryTransTableBody) return;
    if (trans.length === 0) {
      inventoryTransTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:24px;">لا توجد حركات مخزنية مسجلة.</td></tr>`;
      return;
    }

    inventoryTransTableBody.innerHTML = trans.map(tr => {
      let typeBadge = '';
      if (tr.trans_type === 'receive') typeBadge = '<span class="badge badge-success"><i class="fa-solid fa-arrow-down"></i> إضافة وتوريد</span>';
      else if (tr.trans_type === 'issue') typeBadge = '<span class="badge badge-rose"><i class="fa-solid fa-arrow-up"></i> صرف مبيعات</span>';
      else if (tr.trans_type === 'transfer_to_vehicle') typeBadge = '<span class="badge badge-purple"><i class="fa-solid fa-truck-ramp-box"></i> تحويل لسيارة مندوب</span>';
      else typeBadge = '<span class="badge badge-warning">مرتجع</span>';

      return `
        <tr>
          <td><strong>${tr.reference_no || ('TR-' + tr.id)}</strong></td>
          <td>${(tr.created_at || '').substring(0, 16)}</td>
          <td>${typeBadge}</td>
          <td>${tr.vehicle_code ? `<span class="vehicle-code-badge" style="font-size:12px; padding:2px 8px;"><i class="fa-solid fa-truck"></i> ${tr.vehicle_code}</span>` : '<span style="color:#64748b;">-</span>'}</td>
          <td><strong>${tr.item_name || tr.item_code}</strong></td>
          <td><strong style="color: #38bdf8;">${tr.quantity}</strong></td>
          <td>${tr.recipient_name || '-'}</td>
          <td>${tr.notes || '-'}</td>
        </tr>
      `;
    }).join("");
  }

  // فتح وإغلاق مودال المخزون
  if (btnOpenInventoryHub) {
    btnOpenInventoryHub.addEventListener("click", () => {
      loadInventory();
      inventoryHubModal.style.display = "flex";
    });
  }
  if (btnCloseInventoryModal) {
    btnCloseInventoryModal.addEventListener("click", () => {
      inventoryHubModal.style.display = "none";
    });
  }

  // تبويبات المخزون
  document.querySelectorAll(".inv-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".inv-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.getAttribute("data-inv-tab");
      document.getElementById("invPaneStock").style.display = target === "stock" ? "block" : "none";
      document.getElementById("invPaneTrans").style.display = target === "trans" ? "block" : "none";
    });
  });

  // إظهار/إخفاء نماذج المخزون
  if (btnToggleAddStockTrans) {
    btnToggleAddStockTrans.addEventListener("click", () => {
      if (addStockTransFormCard) {
        addStockTransFormCard.style.display = addStockTransFormCard.style.display === "none" ? "block" : "none";
      }
    });
  }
  if (btnCancelAddTrans) {
    btnCancelAddTrans.addEventListener("click", () => {
      if (addStockTransFormCard) addStockTransFormCard.style.display = "none";
    });
  }
  if (btnToggleAddStockItem) {
    btnToggleAddStockItem.addEventListener("click", () => {
      if (addStockItemFormCard) {
        addStockItemFormCard.style.display = addStockItemFormCard.style.display === "none" ? "block" : "none";
      }
    });
  }
  if (btnCancelAddItem) {
    btnCancelAddItem.addEventListener("click", () => {
      if (addStockItemFormCard) addStockItemFormCard.style.display = "none";
    });
  }

  // حفظ إذن مخزني جديد
  if (btnSaveStockTrans) {
    btnSaveStockTrans.addEventListener("click", async () => {
      const itemId = parseInt(transItemSelect.value);
      const transTypeVal = document.getElementById("transType").value;
      const vehCodeVal = transVehicleCode.value;
      const qtyVal = parseFloat(document.getElementById("transQuantity").value);
      const refNo = document.getElementById("transReferenceNo").value.trim();
      const recipient = document.getElementById("transRecipient").value.trim();
      const notes = document.getElementById("transNotes").value.trim();

      if (!itemId || isNaN(qtyVal) || qtyVal <= 0) {
        alert("يرجى اختيار الصنف وتحديد كمية صحيحة أكبر من صفر");
        return;
      }

      try {
        const payload = {
          item_id: itemId,
          trans_type: transTypeVal,
          vehicle_code: vehCodeVal || null,
          quantity: qtyVal,
          reference_no: refNo || null,
          recipient_name: recipient || null,
          notes: notes || null
        };

        const res = await fetch("/api/inventory/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || "تم تسجيل الإذن المخزني بنجاح!");
        if (addStockTransFormCard) addStockTransFormCard.style.display = "none";
        loadInventory();
      } catch (e) {
        alert("حدث خطأ أثناء حفظ الإذن المخزني: " + e.message);
      }
    });
  }

  // حفظ صنف مخزني جديد
  if (btnSaveStockItem) {
    btnSaveStockItem.addEventListener("click", async () => {
      const code = document.getElementById("newItemCode").value.trim().toUpperCase();
      const name = document.getElementById("newItemName").value.trim();
      const cat = document.getElementById("newItemCategory").value.trim();
      const unit = document.getElementById("newItemUnit").value.trim();
      const qty = parseFloat(document.getElementById("newItemQuantity").value) || 0;
      const minQty = parseFloat(document.getElementById("newItemMinQuantity").value) || 10;
      const price = parseFloat(document.getElementById("newItemUnitPrice").value) || 0;

      if (!code || !name) {
        alert("يرجى إدخال كود الصنف واسمه");
        return;
      }

      try {
        const payload = {
          item_code: code,
          item_name: name,
          category: cat,
          unit: unit,
          quantity: qty,
          min_quantity: minQty,
          unit_price: price,
          warehouse: "المستودع الرئيسي"
        };
        const res = await fetch("/api/inventory/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || "تمت إضافة الصنف بنجاح!");
        if (addStockItemFormCard) addStockItemFormCard.style.display = "none";
        loadInventory();
      } catch (e) {
        alert("حدث خطأ أثناء إضافة الصنف: " + e.message);
      }
    });
  }

  // ==========================================================================
  // [6] بوابة الربط والتكامل مع أنظمة ERP (Universal ERP Gateway)
  // ==========================================================================
  async function loadErpConfig() {
    try {
      const res = await fetch("/api/erp/config");
      if (!res.ok) return;
      const data = await res.json();

      if (erpSystemType) erpSystemType.value = data.system_type || "Odoo";
      if (erpServerUrl) erpServerUrl.value = data.server_url || "";
      if (erpCompanyId) erpCompanyId.value = data.company_id || "";
      if (erpApiKey) erpApiKey.value = data.api_key || "";
      if (erpWebhookUrl) erpWebhookUrl.value = data.webhook_url || "";
      if (erpSyncInterval) erpSyncInterval.value = data.sync_interval || "realtime";
      if (erpAutoSync) erpAutoSync.checked = data.auto_sync == 1;

      updateErpChipsUI(data.system_type || "Odoo");
      loadErpLogs(data.system_type || "Odoo");
    } catch (e) {
      console.error("ERP config load error:", e);
    }
  }

  async function loadErpLogs(systemType = "Odoo") {
    if (!erpSyncLogsTableBody) return;
    try {
      const res = await fetch(`/api/erp/config`);
      if (!res.ok) return;
      const data = await res.json();
      const logs = data.recent_logs || [];

      if (logs.length === 0) {
        erpSyncLogsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد عمليات مزامنة سابقة. اضغط "فحص الاتصال" أو "مزامنة فورية الآن".</td></tr>`;
        return;
      }

      erpSyncLogsTableBody.innerHTML = logs.map(l => `
        <tr>
          <td><code>SYNC-${l.id}</code></td>
          <td><strong>${l.system_type}</strong></td>
          <td>${(l.created_at || '').substring(0, 19)}</td>
          <td>${l.sync_type || 'مزامنة شاملة'}</td>
          <td><strong style="color: #38bdf8;">${l.records_synced || 0}</strong></td>
          <td><span class="badge ${l.status === 'success' ? 'badge-success' : (l.status === 'error' ? 'badge-rose' : 'badge-warning')}">${l.status === 'success' ? 'ناجحة' : l.status}</span></td>
          <td>${l.response_message || 'تمت العملية'}</td>
        </tr>
      `).join("");
    } catch (e) {
      console.error("ERP logs error:", e);
    }
  }

  function updateErpChipsUI(systemType) {
    if (erpSelectedName) erpSelectedName.textContent = systemType;
    document.querySelectorAll(".erp-chip").forEach(chip => {
      if (chip.getAttribute("data-system") === systemType) {
        chip.classList.add("active");
      } else {
        chip.classList.remove("active");
      }
    });
  }

  // شرائح أنظمة ERP
  document.querySelectorAll(".erp-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const sys = chip.getAttribute("data-system");
      if (erpSystemType) erpSystemType.value = sys;
      updateErpChipsUI(sys);
    });
  });

  if (erpSystemType) {
    erpSystemType.addEventListener("change", () => {
      updateErpChipsUI(erpSystemType.value);
    });
  }

  // فتح وإغلاق مودال ERP
  if (btnOpenErpHub) {
    btnOpenErpHub.addEventListener("click", () => {
      loadErpConfig();
      erpHubModal.style.display = "flex";
    });
  }
  if (btnCloseErpModal) {
    btnCloseErpModal.addEventListener("click", () => {
      erpHubModal.style.display = "none";
    });
  }

  // فحص الاتصال الحي بنظام ERP
  if (btnTestErpConnection) {
    btnTestErpConnection.addEventListener("click", async () => {
      try {
        btnTestErpConnection.disabled = true;
        btnTestErpConnection.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص الاتصال...`;

        const payload = {
          system_type: erpSystemType.value,
          server_url: erpServerUrl.value.trim(),
          company_id: erpCompanyId.value.trim(),
          api_key: erpApiKey.value.trim()
        };

        const res = await fetch("/api/erp/test-connection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.status === "connected") {
          erpLiveStatusBadge.className = "badge badge-success";
          erpLiveStatusBadge.textContent = "متصل بنجاح بنظام ERP";
          alert(`✅ الاتصال ناجح ومستقر بنظام ${data.system_type}!\n\nزمن الاستجابة: ${data.latency_ms} مللي ثانية\nالرسالة: ${data.message}`);
        } else {
          erpLiveStatusBadge.className = "badge badge-rose";
          erpLiveStatusBadge.textContent = "تعذر الاتصال";
          alert(`❌ تنبيه الاتصال: ${data.message}`);
        }
        loadErpLogs(erpSystemType.value);
      } catch (e) {
        alert("حدث خطأ أثناء فحص اتصال الـ ERP: " + e.message);
      } finally {
        btnTestErpConnection.disabled = false;
        btnTestErpConnection.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> فحص الاتصال الحي الآن`;
      }
    });
  }

  // حفظ إعدادات ERP
  if (btnSaveErpConfig) {
    btnSaveErpConfig.addEventListener("click", async () => {
      try {
        btnSaveErpConfig.disabled = true;
        btnSaveErpConfig.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;

        const payload = {
          system_type: erpSystemType.value,
          server_url: erpServerUrl.value.trim(),
          company_id: erpCompanyId.value.trim(),
          api_key: erpApiKey.value.trim(),
          webhook_url: erpWebhookUrl.value.trim(),
          sync_interval: erpSyncInterval.value,
          auto_sync: erpAutoSync.checked
        };

        const res = await fetch("/api/erp/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        alert(data.message || "تم حفظ إعدادات الربط مع نظام ERP بنجاح!");
      } catch (e) {
        alert("حدث خطأ أثناء حفظ الإعدادات: " + e.message);
      } finally {
        btnSaveErpConfig.disabled = false;
        btnSaveErpConfig.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> حفظ إعدادات الربط`;
      }
    });
  }

  // مزامنة فورية الآن
  if (btnSyncErpNow) {
    btnSyncErpNow.addEventListener("click", async () => {
      try {
        btnSyncErpNow.disabled = true;
        btnSyncErpNow.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري المزامنة مع ERP...`;

        const res = await fetch("/api/erp/sync-now", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ system_type: erpSystemType.value, sync_type: "full_archive_and_inventory" })
        });
        const data = await res.json();

        alert(`✅ تمت المزامنة الفورية بنجاح!\n\nعدد الفواتير المنقولة: ${data.synced_documents || 0}\nعدد حركات المخزون: ${data.synced_inventory_transactions || 0}\nحالة العملية: ${data.message}`);
        loadErpLogs(erpSystemType.value);
      } catch (e) {
        alert("حدث خطأ أثناء المزامنة: " + e.message);
      } finally {
        btnSyncErpNow.disabled = false;
        btnSyncErpNow.innerHTML = `<i class="fa-solid fa-rotate"></i> مزامنة فورية شاملة الآن`;
      }
    });
  }


  // --- منطق تحديد الورق بأجمعه والحذف الجماعي ---
  window.toggleDocSelection = function(docId) {
    if (state.selectedDocIds.has(docId)) {
      state.selectedDocIds.delete(docId);
    } else {
      state.selectedDocIds.add(docId);
    }
    updateSelectionUI();
  };

  function updateSelectionUI() {
    const count = state.selectedDocIds.size;
    if (count > 0) {
      bulkActionsToolbar.style.display = "inline-flex";
      selectedCountBadge.style.display = "inline-flex";
      selectedCountBadge.textContent = `${count} محدد`;
      bulkDeleteCount.textContent = count;
    } else {
      bulkActionsToolbar.style.display = "none";
      selectedCountBadge.style.display = "none";
    }

    const allCardChecks = document.querySelectorAll(".doc-card-select-check");
    if (allCardChecks.length > 0) {
      selectAllCheckbox.checked = count > 0 && count === allCardChecks.length;
    } else {
      selectAllCheckbox.checked = false;
    }
  }

  selectAllCheckbox.addEventListener("change", () => {
    const allCards = document.querySelectorAll(".doc-card");
    if (selectAllCheckbox.checked) {
      allCards.forEach(card => {
        const id = parseInt(card.getAttribute("data-id"));
        if (id) state.selectedDocIds.add(id);
      });
    } else {
      state.selectedDocIds.clear();
    }
    // تحديث الشيك بوكس على كل كارت
    document.querySelectorAll(".doc-card-select-check").forEach(chk => {
      const id = parseInt(chk.getAttribute("data-id"));
      chk.checked = state.selectedDocIds.has(id);
    });
    updateSelectionUI();
  });

  btnDeselectAll.addEventListener("click", () => {
    state.selectedDocIds.clear();
    document.querySelectorAll(".doc-card-select-check").forEach(chk => chk.checked = false);
    updateSelectionUI();
  });

  // تنفيذ الحذف الجماعي للأوراق المحددة
  btnBulkDeleteSelected.addEventListener("click", async () => {
    const count = state.selectedDocIds.size;
    if (count === 0) return;
    const confirmed = confirm(`تحذير: هل أنت متأكد من رغبتك في حذف ${count} مستنداً مالياً نهائياً من أرشيف خلدون؟`);
    if (!confirmed) return;

    btnBulkDeleteSelected.disabled = true;
    btnBulkDeleteSelected.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحذف...`;

    try {
      const res = await fetch("/api/documents/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_ids: Array.from(state.selectedDocIds) })
      });
      const data = await res.json();
      alert(data.message || `تم حذف ${count} مستند بنجاح`);
      state.selectedDocIds.clear();
      updateSelectionUI();
      loadStats();
      loadDocuments();
    } catch (err) {
      alert("حدث خطأ أثناء الحذف الجماعي");
    } finally {
      btnBulkDeleteSelected.disabled = false;
      btnBulkDeleteSelected.innerHTML = `<i class="fa-solid fa-trash-can"></i> حذف المحدد (<span id="bulkDeleteCount">0</span>)`;
    }
  });

  // زر الحذف بجانب مربع البحث (سريع أو يفتح تنظيف القديم)
  btnQuickDeleteSearch.addEventListener("click", () => {
    if (state.selectedDocIds.size > 0) {
      btnBulkDeleteSelected.click();
    } else {
      cleanupOldModal.style.display = "flex";
    }
  });

  // --- نافذة البحث المتقدم الشامل في كافة تفاصيل الورقة ---
  btnOpenAdvancedSearch.addEventListener("click", () => {
    advancedSearchModal.style.display = "flex";
  });

  btnCloseAdvSearchModal.addEventListener("click", () => {
    advancedSearchModal.style.display = "none";
  });

  btnResetAdvSearch.addEventListener("click", () => {
    advSigQuery.value = "";
    advHwQuery.value = "";
    advMarksQuery.value = "";
    advFullTextQuery.value = "";
    advDateFrom.value = "";
    advDateTo.value = "";
    advMinAmount.value = "";
    advMaxAmount.value = "";
    state.advFilters = {
      sigQuery: "",
      hwQuery: "",
      marksQuery: "",
      fullTextQuery: "",
      dateFrom: "",
      dateTo: ""
    };
    state.minAmount = null;
    state.maxAmount = null;
  });

  btnExecuteAdvSearch.addEventListener("click", () => {
    state.advFilters.sigQuery = advSigQuery.value.trim();
    state.advFilters.hwQuery = advHwQuery.value.trim();
    state.advFilters.marksQuery = advMarksQuery.value.trim();
    state.advFilters.fullTextQuery = advFullTextQuery.value.trim();
    state.advFilters.dateFrom = advDateFrom.value;
    state.advFilters.dateTo = advDateTo.value;
    state.minAmount = advMinAmount.value ? parseFloat(advMinAmount.value) : null;
    state.maxAmount = advMaxAmount.value ? parseFloat(advMaxAmount.value) : null;

    advancedSearchModal.style.display = "none";
    state.page = 1;
    loadDocuments();
  });

  // --- نافذة إضافة مستند جديد يدوياً ---
  btnOpenManualAdd.addEventListener("click", () => {
    document.getElementById("manDocDate").value = new Date().toISOString().split("T")[0];
    manualDocModal.style.display = "flex";
  });

  btnCloseManualDocModal.addEventListener("click", () => {
    manualDocModal.style.display = "none";
  });

  btnCancelManualDoc.addEventListener("click", () => {
    manualDocModal.style.display = "none";
  });

  btnSaveManualDoc.addEventListener("click", async () => {
    const num = document.getElementById("manDocNumber").value.trim();
    const dateVal = document.getElementById("manDocDate").value;
    if (!num || !dateVal) {
      alert("يرجى كتابة رقم المستند وتاريخه");
      return;
    }

    const formData = new FormData();
    formData.append("doc_number", num);
    formData.append("doc_type", document.getElementById("manDocType").value);
    formData.append("doc_date", dateVal);
    formData.append("amount", parseFloat(document.getElementById("manDocAmount").value || "0"));
    formData.append("party_name", document.getElementById("manPartyName").value.trim());
    formData.append("delegate_name", document.getElementById("manDelegateName").value.trim());
    formData.append("copier_name", document.getElementById("manCopierName").value);
    formData.append("has_signature", document.getElementById("manHasSignature").checked ? 1 : 0);
    formData.append("signature_info", document.getElementById("manSigInfo").value.trim());
    formData.append("has_handwriting", document.getElementById("manHasHandwriting").checked ? 1 : 0);
    formData.append("handwritten_notes", document.getElementById("manHwNotes").value.trim());
    formData.append("has_special_marks", document.getElementById("manHasMarks").checked ? 1 : 0);
    formData.append("special_marks", document.getElementById("manMarksInfo").value.trim());

    const fileInput = document.getElementById("manDocFile");
    if (fileInput.files.length > 0) {
      formData.append("file", fileInput.files[0]);
    }

    btnSaveManualDoc.disabled = true;
    btnSaveManualDoc.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...`;

    try {
      const res = await fetch("/api/documents/manual", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      alert(data.message || "تم حفظ المستند بنجاح");
      manualDocModal.style.display = "none";
      loadStats();
      loadDocuments();
    } catch (e) {
      alert("حدث خطأ أثناء حفظ المستند");
    } finally {
      btnSaveManualDoc.disabled = false;
      btnSaveManualDoc.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> حفظ وأرشفة المستند`;
    }
  });

  // --- نافذة تنظيف وحذف البيانات القديمة ---
  btnOpenCleanupOld.addEventListener("click", () => {
    cleanupOldModal.style.display = "flex";
  });

  btnCloseCleanupModal.addEventListener("click", () => {
    cleanupOldModal.style.display = "none";
  });

  btnCancelCleanup.addEventListener("click", () => {
    cleanupOldModal.style.display = "none";
  });

  btnConfirmCleanup.addEventListener("click", async () => {
    const selectedRadio = document.querySelector('input[name="cleanupRadio"]:checked');
    if (!selectedRadio) return;

    const val = selectedRadio.value;
    const isAll = (val === "all");
    const msg = isAll
      ? "تحذير شديد: هل تريد بالتأكيد تفريغ كافة البيانات المؤرشفة في النظام؟"
      : `هل تريد بالتأكيد حذف كافة المستندات الأقدم من ${val} يوماً؟`;

    if (!confirm(msg)) return;

    btnConfirmCleanup.disabled = true;
    btnConfirmCleanup.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري التنظيف...`;

    try {
      const res = await fetch("/api/documents/cleanup-old", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: isAll ? 0 : parseInt(val),
          clear_all: isAll
        })
      });
      const data = await res.json();
      alert(data.message || "تم تنظيف البيانات بنجاح");
      cleanupOldModal.style.display = "none";
      state.selectedDocIds.clear();
      updateSelectionUI();
      loadStats();
      loadDocuments();
    } catch (e) {
      alert("حدث خطأ في عملية التنظيف");
    } finally {
      btnConfirmCleanup.disabled = false;
      btnConfirmCleanup.innerHTML = `<i class="fa-solid fa-trash-can"></i> تأكيد الحذف والتنظيف`;
    }
  });

  // --- محادثة بوت خلدون للذكاء الاصطناعي ---
  window.sendBotMessage = async function(customText = null) {
    const text = customText || botInputText.value.trim();
    if (!text) return;

    // إضافة رسالة المستخدم
    appendChatMessage("user", text);
    botInputText.value = "";

    // إضافة رسالة مؤقتة "جاري التفكير والبحث..."
    const tempBotId = `bot_temp_${Date.now()}`;
    const loadingHtml = `
      <div class="chat-msg bot" id="${tempBotId}">
        <div class="msg-bubble">
          <i class="fa-solid fa-spinner fa-spin" style="color: #8b5cf6;"></i>
          <span>جاري البحث الذكي والتفتيش في أوراق الأرشيف المالي...</span>
        </div>
      </div>
    `;
    botChatMessages.insertAdjacentHTML("beforeend", loadingHtml);
    botChatMessages.scrollTop = botChatMessages.scrollHeight;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();

      // حذف رسالة التحميل
      const tempEl = document.getElementById(tempBotId);
      if (tempEl) tempEl.remove();

      appendChatMessage("bot", data.reply, data.matched_documents);

    } catch (err) {
      console.error("Bot chat error:", err);
      const tempEl = document.getElementById(tempBotId);
      if (tempEl) {
        tempEl.querySelector(".msg-bubble").innerHTML = `<span style="color: #f43f5e;">حدث خطأ في الاتصال بمحرك الذكاء الاصطناعي.</span>`;
      }
    }
  };

  btnSendBot.addEventListener("click", () => window.sendBotMessage());

  function appendChatMessage(role, text, matchedDocs = []) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-msg ${role}`;

    let docsRowHtml = "";
    if (matchedDocs && matchedDocs.length > 0) {
      docsRowHtml = `
        <div class="chat-doc-cards-row">
          ${matchedDocs.map(d => `
            <div class="chat-doc-mini-card" onclick="window.openDocModalDirect(${d.id})">
              <img src="/storage/${d.thumbnail_path}" alt="${d.doc_number}">
              <h5>${d.doc_number}</h5>
              <span>${Number(d.amount).toLocaleString('ar-EG')} ج.م</span>
            </div>
          `).join("")}
        </div>
      `;
    }

    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
      <div class="msg-bubble">
        <p>${formattedText}</p>
        ${docsRowHtml}
      </div>
    `;

    botChatMessages.appendChild(msgDiv);
    botChatMessages.scrollTop = botChatMessages.scrollHeight;
  }

  window.openDocModalDirect = function(id) {
    openDocModal(id);
  };

  quickPills.forEach(pill => {
    pill.addEventListener("click", () => {
      const prompt = pill.getAttribute("data-prompt");
      window.sendBotMessage(prompt);
    });
  });

  btnClearChat.addEventListener("click", () => {
    botChatMessages.innerHTML = `
      <div class="chat-msg bot">
        <div class="msg-bubble">
          <p>تم مسح المحادثة. يمكنك بدء سؤال جديد عن أي فاتورة أو إمضاء مندوب أو علامة مميزة!</p>
        </div>
      </div>
    `;
  });

  // --- أحداث الفلاتر والبحث ---
  btnSearchTrigger.addEventListener("click", () => {
    state.search = mainSearchInput.value.trim();
    state.page = 1;
    loadDocuments();
  });

  mainSearchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      state.search = mainSearchInput.value.trim();
      state.page = 1;
      loadDocuments();
    }
  });

  mainSearchInput.addEventListener("input", () => {
    btnClearSearch.style.display = mainSearchInput.value ? "block" : "none";
  });

  btnClearSearch.addEventListener("click", () => {
    mainSearchInput.value = "";
    btnClearSearch.style.display = "none";
    state.search = "";
    state.page = 1;
    loadDocuments();
  });

  filterChips.forEach(chip => {
    chip.addEventListener("click", () => {
      filterChips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const f = chip.getAttribute("data-filter");

      state.hasSignature = null;
      state.hasHandwriting = null;
      state.hasSpecialMarks = null;

      if (f === "signed") state.hasSignature = '1';
      else if (f === "unsigned") state.hasSignature = '0';
      else if (f === "handwriting") state.hasHandwriting = '1';
      else if (f === "marked") state.hasSpecialMarks = '1';

      state.page = 1;
      loadDocuments();
    });
  });

  filterDocType.addEventListener("change", () => {
    state.docType = filterDocType.value;
    state.page = 1;
    loadDocuments();
  });

  filterDelegate.addEventListener("change", () => {
    state.delegateName = filterDelegate.value;
    state.page = 1;
    loadDocuments();
  });

  filterMinAmount.addEventListener("change", () => {
    state.minAmount = filterMinAmount.value ? parseFloat(filterMinAmount.value) : null;
    state.page = 1;
    loadDocuments();
  });

  filterMaxAmount.addEventListener("change", () => {
    state.maxAmount = filterMaxAmount.value ? parseFloat(filterMaxAmount.value) : null;
    state.page = 1;
    loadDocuments();
  });

  btnResetFilters.addEventListener("click", () => {
    mainSearchInput.value = "";
    btnClearSearch.style.display = "none";
    state.search = "";
    state.hasSignature = null;
    state.hasHandwriting = null;
    state.hasSpecialMarks = null;
    state.docType = "الكل";
    state.delegateName = "الكل";
    state.minAmount = null;
    state.maxAmount = null;

    filterDocType.value = "الكل";
    filterDelegate.value = "الكل";
    filterMinAmount.value = "";
    filterMaxAmount.value = "";

    filterChips.forEach(c => c.classList.remove("active"));
    filterChips[0].classList.add("active");

    state.page = 1;
    loadDocuments();
  });

  btnPrevPage.addEventListener("click", () => {
    if (state.page > 1) {
      state.page--;
      loadDocuments();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  });

  btnNextPage.addEventListener("click", () => {
    if (state.page < state.totalPages) {
      state.page++;
      loadDocuments();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  });

  // --- سحب دفعة الـ 1000 ورقة (الميزة المحورية لطلب المستخدم) ---
  btnGen1000.addEventListener("click", async () => {
    const confirmed = confirm("هل تريد بدء سحب وأرشفة دفعة كبرى تتكون من 1000 ورقة فواتير ومستندات مالية وفهرستها بالذكاء الاصطناعي؟");
    if (!confirmed) return;

    btnGen1000.disabled = true;
    btnGen1000.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري السحب...</span>`;

    try {
      const res = await fetch("/api/batches/generate_1000?count=1000", { method: "POST" });
      const data = await res.json();
      
      batchProgressWrapper.style.display = "block";
      batchProgressName.textContent = "دفعة سحب ماكينة تصوير كبرى (1000 ورقة) - جاري السحب والحفظ";
      batchProgressBarFill.style.width = "5%";
      batchProgressCount.textContent = "50 / 1000 ورقة";
      batchProgressPercent.textContent = "5%";

      alert("تم إطلاق عملية سحب وفهرسة الـ 1000 ورقة في الخلفية بنجاح! سيتم تحديث الأرشيف والإحصائيات مباشرة أمامك.");

    } catch (err) {
      console.error(err);
      alert("حدث خطأ في تشغيل الدفعة.");
    } finally {
      setTimeout(() => {
        btnGen1000.disabled = false;
        btnGen1000.innerHTML = `<i class="fa-solid fa-bolt"></i> <span>سحب دفعة (1000 ورقة)</span>`;
      }, 3000);
    }
  });

  // --- سحب سريع (10 ورقات) ---
  btnQuickScan.addEventListener("click", async () => {
    btnQuickScan.disabled = true;
    btnQuickScan.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري السحب...</span>`;
    try {
      await fetch("/api/scanner/trigger_test_scan?pages=10", { method: "POST" });
      await loadStats();
      await loadDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      btnQuickScan.disabled = false;
      btnQuickScan.innerHTML = `<i class="fa-solid fa-file-import"></i> <span>سحب 10 ورقات</span>`;
    }
  });

  // --- دليل ربط ماكينة التصوير ومسار السحب ---
  btnCopierGuide.addEventListener("click", () => {
    copierGuideModal.style.display = "flex";
  });

  btnCloseGuideModal.addEventListener("click", () => {
    copierGuideModal.style.display = "none";
  });

  btnCopyHotPath.addEventListener("click", () => {
    navigator.clipboard.writeText(hotFolderPathDisplay.textContent.trim());
    btnCopyHotPath.innerHTML = `<i class="fa-solid fa-check"></i> تم النسخ!`;
    setTimeout(() => {
      btnCopyHotPath.innerHTML = `<i class="fa-solid fa-copy"></i> نسخ المسار`;
    }, 2000);
  });

  // --- رفع ملفات المسح الضوئي يدوياً ---
  btnUploadModal.addEventListener("click", () => {
    uploadModal.style.display = "flex";
  });

  btnCloseUploadModal.addEventListener("click", () => {
    uploadModal.style.display = "none";
    uploadFileList.innerHTML = "";
    btnSubmitUpload.style.display = "none";
  });

  manualFileInput.addEventListener("change", () => {
    const files = manualFileInput.files;
    if (files.length > 0) {
      uploadFileList.innerHTML = `<strong>الملفات المحددة (${files.length} ملف):</strong>` +
        Array.from(files).map(f => `<div style="font-size: 12px; color: #94a3b8; padding: 2px 0;">📄 ${f.name} (${(f.size/1024).toFixed(1)} KB)</div>`).join("");
      btnSubmitUpload.style.display = "inline-flex";
    }
  });

  btnSubmitUpload.addEventListener("click", async () => {
    const files = manualFileInput.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    btnSubmitUpload.disabled = true;
    btnSubmitUpload.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري الرفع والأرشفة...`;

    try {
      const res = await fetch("/api/batches/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      alert(data.message || "تم رفع الملفات بنجاح");
      uploadModal.style.display = "none";
      loadStats();
      loadDocuments();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في رفع الملفات");
    } finally {
      btnSubmitUpload.disabled = false;
      btnSubmitUpload.innerHTML = `<i class="fa-solid fa-check"></i> بدء الأرشفة والفهرسة`;
    }
  });

  // --- الإعدادات ومفتاح Gemini API ---
  btnSettings.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      settingSysName.value = data.system_name || "خلدون للأرشيف المالي";
      settingHotFolder.value = data.hot_folder_path || "";
      settingsModal.style.display = "flex";
    } catch (err) {
      console.error(err);
    }
  });

  btnCloseSettingsModal.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  btnSaveSettings.addEventListener("click", async () => {
    const payload = {
      system_name: settingSysName.value.trim(),
      hot_folder_path: settingHotFolder.value.trim(),
      gemini_api_key: settingApiKey.value.trim() || undefined
    };

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      alert(data.message || "تم الحفظ بنجاح");
      settingsModal.style.display = "none";
      loadStats();
    } catch (err) {
      alert("خطأ في حفظ الإعدادات");
    }
  });

  // --- إدارة ماكينات التصوير المتصلة بالشير نتورك ---
  async function loadCopiers() {
    try {
      const res = await fetch("/api/copiers");
      const data = await res.json();
      state.copiersList = data.copiers || [];

      if (copierSharedNetworkPath) {
        copierSharedNetworkPath.textContent = data.shared_smb_path;
      }
      if (copierCountBadge) {
        copierCountBadge.textContent = `${state.copiersList.length} ماكينات متصلة`;
      }

      // تحديث القائمة المنسدلة في الهيدر الرئيسي
      const currentSelected = copierDropdown.value || "all";
      copierDropdown.innerHTML = `<option value="all">🌐 كل الماكينات المتصلة بالشير (استقبال شامل)</option>`;

      state.copiersList.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.name;
        const statusIcon = c.status === "online" ? "🟢" : "🔴";
        opt.textContent = `${statusIcon} ${c.name} (${c.ip_address || 'شبكة محلية'})`;
        if (c.name === currentSelected || (currentSelected === "all" && c.is_default && state.selectedCopier === c.name)) {
          opt.selected = true;
        }
        copierDropdown.appendChild(opt);
      });

      renderCopierCards();

    } catch (err) {
      console.error("Load copiers error:", err);
    }
  }

  function renderCopierCards() {
    if (!copiersCardsContainer) return;
    copiersCardsContainer.innerHTML = state.copiersList.map(c => {
      const statusClass = c.status === "online" ? "status-online" : "status-offline";
      const statusText = c.status === "online" ? "متصلة 🟢" : "غير متصلة 🔴";
      const defaultBadge = c.is_default ? `<span class="badge badge-success" style="font-size: 10.5px;">الماكينة الافتراضية النشطة</span>` : "";

      return `
        <div class="copier-card ${c.is_default ? 'is-default' : ''}" data-id="${c.id}">
          <div class="copier-card-header">
            <span class="copier-brand-badge"><i class="fa-solid fa-print"></i> ${c.brand}</span>
            <span class="copier-status-pill ${statusClass}" id="copier_status_${c.id}">${statusText}</span>
          </div>
          <h4 class="copier-card-title">${c.name}</h4>
          <div class="copier-card-details">
            <div><i class="fa-solid fa-network-wired"></i> عنوان IP: <strong>${c.ip_address || 'غير محدد'}</strong></div>
            <div><i class="fa-solid fa-location-dot"></i> الموقع: ${c.location || 'غير محدد'}</div>
            <div><i class="fa-solid fa-folder-tree"></i> مجلد الشير: <code>${c.share_folder || 'incoming_scans'}</code></div>
          </div>
          <div class="copier-card-actions">
            <button class="btn btn-sm btn-outline btn-ping-copier" data-id="${c.id}" title="اختبار الاتصال بالماكينة">
              <i class="fa-solid fa-bolt"></i> اختبار اتصال
            </button>
            ${!c.is_default ? `<button class="btn btn-sm btn-secondary btn-set-default" data-id="${c.id}">تعيين كافتراضية</button>` : defaultBadge}
            <button class="btn btn-sm btn-outline btn-delete-copier" data-id="${c.id}" style="color: #f43f5e; margin-right: auto;" title="حذف">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    }).join("");

    // ربط أزرار بطاقات الماكينات
    document.querySelectorAll(".btn-ping-copier").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> فحص...`;
        try {
          const res = await fetch(`/api/copiers/${id}/ping`, { method: "POST" });
          const resData = await res.json();
          alert(resData.message);
          loadCopiers();
        } catch (e) {
          alert("فشل فحص الاتصال بالماكينة");
        }
      });
    });

    document.querySelectorAll(".btn-set-default").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await fetch(`/api/copiers/${id}/activate`, { method: "PUT" });
        loadCopiers();
      });
    });

    document.querySelectorAll(".btn-delete-copier").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("هل تريد بالتأكيد إزالة هذه الماكينة من قائمة الشبكة؟")) {
          await fetch(`/api/copiers/${id}`, { method: "DELETE" });
          loadCopiers();
        }
      });
    });
  }

  // تغيير الماكينة النشطة من القائمة المنسدلة في الهيدر
  copierDropdown.addEventListener("change", () => {
    state.selectedCopier = copierDropdown.value;
    state.page = 1;
    loadDocuments();
  });

  // فتح وإغلاق نافذة إدارة ماكينات الشبكة
  btnOpenCopiersManager.addEventListener("click", () => {
    loadCopiers();
    copiersManagerModal.style.display = "flex";
  });

  btnCloseCopiersModal.addEventListener("click", () => {
    copiersManagerModal.style.display = "none";
  });

  btnCopySmbShare.addEventListener("click", () => {
    navigator.clipboard.writeText(copierSharedNetworkPath.textContent.trim());
    btnCopySmbShare.innerHTML = `<i class="fa-solid fa-check"></i> تم النسخ!`;
    setTimeout(() => {
      btnCopySmbShare.innerHTML = `<i class="fa-solid fa-copy"></i> نسخ مسار الشير`;
    }, 2000);
  });

  // إظهار/إخفاء نموذج إضافة ماكينة
  btnToggleAddCopier.addEventListener("click", () => {
    addCopierFormCard.style.display = addCopierFormCard.style.display === "none" ? "block" : "none";
  });

  btnCancelAddCopier.addEventListener("click", () => {
    addCopierFormCard.style.display = "none";
  });

  btnSaveNewCopier.addEventListener("click", async () => {
    const name = newCopierName.value.trim();
    if (!name) {
      alert("يرجى كتابة اسم الماكينة");
      return;
    }
    const payload = {
      name: name,
      brand: newCopierBrand.value,
      ip_address: newCopierIp.value.trim(),
      location: newCopierLocation.value.trim()
    };

    try {
      const res = await fetch("/api/copiers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      alert(data.message || "تمت إضافة الماكينة بنجاح");
      addCopierFormCard.style.display = "none";
      newCopierName.value = "";
      newCopierIp.value = "";
      newCopierLocation.value = "";
      loadCopiers();
    } catch (e) {
      alert("حدث خطأ في إضافة الماكينة");
    }
  });

  // فحص الشبكة التلقائي لاكتشاف الماكينات (Auto Discovery)
  btnDiscoverNetwork.addEventListener("click", async () => {
    btnDiscoverNetwork.disabled = true;
    btnDiscoverNetwork.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص الشبكة المشتركة...`;
    discoveryResultsPanel.style.display = "block";
    discoveryList.innerHTML = `<div style="color: #c7d2fe; padding: 10px;"><i class="fa-solid fa-spinner fa-spin"></i> جاري فحص أجهزة الشبكة في النطاق المحلي...</div>`;

    try {
      const res = await fetch("/api/copiers/discover", { method: "POST" });
      const data = await res.json();
      const devices = data.discovered_devices || [];

      if (devices.length === 0) {
        discoveryList.innerHTML = `<div style="color: #94a3b8; padding: 10px;">لم يتم العثور على أجهزة شبكية جديدة حالياً في جدول ARP. يمكنك إضافة عنوان IP للماكينة يدوياً عبر زر "إضافة ماكينة جديدة".</div>`;
      } else {
        discoveryList.innerHTML = devices.map(d => `
          <div class="discovery-item">
            <div>
              <strong>${d.name}</strong>
              <div style="font-size: 11.5px; color: #94a3b8;">IP: ${d.ip} | MAC: ${d.mac}</div>
            </div>
            <button class="btn btn-sm btn-emerald btn-quick-add-copier" data-name="${d.name}" data-brand="${d.brand}" data-ip="${d.ip}">
              <i class="fa-solid fa-plus"></i> إضافة للشير
            </button>
          </div>
        `).join("");

        document.querySelectorAll(".btn-quick-add-copier").forEach(btn => {
          btn.addEventListener("click", async () => {
            const p = {
              name: btn.getAttribute("data-name"),
              brand: btn.getAttribute("data-brand") || "Generic",
              ip_address: btn.getAttribute("data-ip"),
              location: "الشبكة المحلية المشتركة"
            };
            await fetch("/api/copiers", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(p)
            });
            alert(`تمت إضافة ${p.name} لقائمة ماكينات الأرشيف بنجاح!`);
            loadCopiers();
          });
        });
      }

    } catch (e) {
      discoveryList.innerHTML = `<div style="color: #f43f5e; padding: 10px;">حدث خطأ أثناء فحص الشبكة.</div>`;
    } finally {
      btnDiscoverNetwork.disabled = false;
      btnDiscoverNetwork.innerHTML = `<i class="fa-solid fa-radar"></i> فحص الشبكة لاكتشاف الماكينات`;
    }
  });

  // إغلاق أي نافذة مودال بالنقر خارجها
  window.addEventListener("click", (e) => {
    if (e.target === docModal) docModal.style.display = "none";
    if (e.target === copierGuideModal) copierGuideModal.style.display = "none";
    if (e.target === copiersManagerModal) copiersManagerModal.style.display = "none";
    if (e.target === uploadModal) uploadModal.style.display = "none";
    if (e.target === settingsModal) settingsModal.style.display = "none";
    if (e.target === advancedSearchModal) advancedSearchModal.style.display = "none";
    if (e.target === manualDocModal) manualDocModal.style.display = "none";
    if (e.target === cleanupOldModal) cleanupOldModal.style.display = "none";
    if (e.target === vehiclesDossierModal) vehiclesDossierModal.style.display = "none";
    if (e.target === singleVehicleDossierModal) singleVehicleDossierModal.style.display = "none";
    if (e.target === inventoryHubModal) inventoryHubModal.style.display = "none";
    if (e.target === erpHubModal) erpHubModal.style.display = "none";
  });

  // بدء التشغيل والتحديث الدوري الحقيقي
  loadCopiers();
  loadStats();
  loadDocuments();
  loadVehicles();
  loadInventory();
  loadErpConfig();
  state.pollInterval = setInterval(loadStats, 3000);
});
