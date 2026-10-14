const UI = {
  zh: {
    pageTitle: '最少步试卷编辑器 · FMC Paper', home: 'FMC Paper 首页', brand: '最少步试卷编辑器', local: 'By · 2019ZENG04',
    editor: '试卷编辑区', headline1: '一组打乱，', headline2: '一张专属试卷', intro: '从第一步到最后一笔，为下一次最少步练习做好准备。',
    info: '试卷信息', optional: '选填', language: '语言', competition: '比赛 / 练习名称', competitionPlaceholder: '例如：周末最少步练习',
    round: '轮次', roundPlaceholder: '输入正整数，留空隐藏', attempt: '尝试序号', hiddenOption: '不显示', attempt1: '第 1 次', attempt2: '第 2 次', attempt3: '第 3 次',
    competitor: '选手姓名', handwritten: '留空供手写', wcaId: 'WCA ID', roundInvalid: '轮次请填写正整数，或留空以隐藏该行。',
    scramble: '打乱公式', clear: '清空', scramblePlaceholder: "在这里输入或粘贴打乱…\n例如：R U R' U' F2",
    invalidMoves: '存在无法识别的转动', validMoves: '打乱有效 · 魔方状态已同步', emptyMoves: '打乱为空 · 魔方已还原', needsFix: '待修正', moveCount: '{count} 步',
    notation1: '仅支持六面转动，可连续输入或用空格分隔。', notation2: '不支持整体转体、宽层和中层转动。',
    invalidPosition: '第 {start}–{end} 个字符「{text}」无法识别。', moreErrors: '还有其他错误，请逐一修正。',
    exportSection: '导出试卷', exportTitle: '准备好，就落笔吧', exportSubtitle: '单页试卷 · 高清导出 · 适合打印', pdf: 'PDF 文件', png: 'PNG 图片', exportButton: '导出', printButton: '打印', exportType: '选择导出类型', openingPrint: '正在打开打印对话框…', printFailed: '无法打开打印对话框，请在浏览器中重新打开文件后重试。', printUnavailable: '当前试卷暂时无法打印，请返回编辑页面修正输入或等待字体准备完成。',
    preparingFont: '正在准备试卷字体…', retry: '重新加载字体', fontFailed: '试卷字体加载失败，请重新加载。', fixMoves: '修正错误后即可导出或打印', fixLayout: '请调整内容后导出或打印',
    exportNote: 'PDF 适合打印 · PNG 为 2480 × 3508 像素', generating: '正在生成 {format}，请稍候…', downloaded: '{format} 已生成，下载已开始。',
    componentsFailed: '导出组件未能加载，请确认本地服务或网络连接正常后，再次选择导出。', imageFailed: '图片生成失败，请重试。', exportFailed: '导出失败，请稍后重试。',
    privacy: '输入内容仅在当前页面处理，不上传、不保存。', preview: '试卷预览', live: '实时同步', waiting: '等待修正', stale: '当前显示上一次有效状态',
    previewCaption: '预览即导出效果', answerGrid: '8 行 × 10 格答题区', footer: '让练习回到纸上', reference: '以参考试卷重绘', credits: '开源致谢',
    creditsLoading: '正在加载许可证…', creditsFailed: '许可证加载失败，请关闭后重新打开。', close: '关闭', bundled: '本地版所需组件已全部内置。', noScript: '请启用 JavaScript，以使用实时魔方预览和文件导出。',
  },
  en: {
    pageTitle: 'Fewest Moves Worksheet Generator · FMC Paper', home: 'FMC Paper home', brand: 'Fewest Moves Worksheet Generator', local: 'By · 2019ZENG04',
    editor: 'Worksheet editor', headline1: 'One scramble. ', headline2: 'Your own worksheet', intro: 'From the first move to the final answer. Get ready for your next Fewest Moves practice.',
    info: 'Worksheet details', optional: 'Optional', language: 'Language', competition: 'Competition / practice name', competitionPlaceholder: 'e.g. Weekend FMC practice',
    round: 'Round', roundPlaceholder: 'Number; blank to hide', attempt: 'Attempt', hiddenOption: 'Do not show', attempt1: 'Attempt 1', attempt2: 'Attempt 2', attempt3: 'Attempt 3',
    competitor: 'Competitor', handwritten: 'Leave blank for handwriting', wcaId: 'WCA ID', roundInvalid: 'Enter a positive whole number for Round, or leave it blank to hide the row.',
    scramble: 'Scramble', clear: 'Clear', scramblePlaceholder: "Type or paste a scramble…\ne.g. R U R' U' F2",
    invalidMoves: 'Unrecognized moves found', validMoves: 'Valid scramble · Cube updated', emptyMoves: 'Empty scramble · Cube solved', needsFix: 'Needs correction', moveCount: '{count} moves',
    notation1: 'Face turns only. Spaces and continuous notation are supported.', notation2: 'Rotations, wide moves and slice moves are not supported.',
    invalidPosition: 'Characters {start}–{end} “{text}” are not recognized.', moreErrors: 'There are more errors. Please correct them in turn.',
    exportSection: 'Export worksheet', exportTitle: 'Ready to put pen to paper', exportSubtitle: 'Single page · High resolution · Print ready', pdf: 'PDF file', png: 'PNG image', exportButton: 'Export', printButton: 'Print', exportType: 'Choose export type', openingPrint: 'Opening the print dialog…', printFailed: 'Could not open the print dialog. Reopen this file in a browser and try again.', printUnavailable: 'This worksheet is not ready to print. Return to the editor to correct your entries or wait for the font to load.',
    preparingFont: 'Preparing the worksheet font…', retry: 'Reload font', fontFailed: 'The worksheet font could not load. Please reload it.', fixMoves: 'Correct the scramble to enable export and printing', fixLayout: 'Adjust the content to enable export and printing',
    exportNote: 'PDF for printing · PNG at 2480 × 3508 pixels', generating: 'Generating {format}. Please wait…', downloaded: '{format} generated. Your download has started.',
    componentsFailed: 'The export components could not load. Check your local server or connection, then choose Export again.', imageFailed: 'The image could not be generated. Please try again.', exportFailed: 'Export failed. Please try again.',
    privacy: 'Your entries stay on this page. Nothing is uploaded or saved.', preview: 'Worksheet preview', live: 'Live preview', waiting: 'Needs correction', stale: 'Showing the last valid state',
    previewCaption: 'Your export matches this preview', answerGrid: '8 rows × 10 answer spaces', footer: 'Bring practice back to paper', reference: 'Redrawn from the reference sheet', credits: 'Open-source credits',
    creditsLoading: 'Loading licenses…', creditsFailed: 'Licenses could not load. Close and reopen to retry.', close: 'Close', bundled: 'All components needed for offline use are included.', noScript: 'Enable JavaScript to use the live cube preview and file exports.',
  },
};

function translate(lang, key, values = {}) {
  return (UI[lang][key] ?? UI.en[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? `{${name}}`);
}

function localizeDOM(lang) {
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = translate(lang, 'pageTitle');
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = translate(lang, element.dataset.i18n);
  for (const [attribute, target] of [['data-i18n-placeholder', 'placeholder'], ['data-i18n-aria', 'aria-label']]) {
    for (const element of document.querySelectorAll(`[${attribute}]`)) element.setAttribute(target, translate(lang, element.getAttribute(attribute)));
  }
}

const SHEET = {
  zh: {
    roundValue: '第 {number} 轮', attemptValue: '第 {number} 次',
    title: '三阶最少步', rulesError: '规则与转动说明无法完整排入试卷。', tooLong: '过长，请缩短后导出。', scrambleError: '打乱过长，已超出三行，请缩短后导出。', cubeLabel: '六面魔方状态图', previewLabel: 'A4 最少步试卷预览', competition: '比赛', round: '轮次', attempt: '尝试', name: '选手', id: 'WCA ID',
    grading: '选手请勿填写', graded: '阅卷人', result: '成绩', scramble: '打乱',
    faces: '单层转动', rotations: '整体转动', clockwise: '顺时针', counter: '逆时针', double: '180度',
    rules: [
      '你有一小时时间寻找解法。',
      '每横线一步，如需删除转动，请清晰地将其涂黑。',
      '禁止通过打乱公式的任何部分直接推得解法。',
      '你的解法长度不能超过 80 步，包括整体转动。',
      '你的解法长度会根据 OBTM 计算。',
      '只能使用 WCA 规则第 12 章所述的转动表示方法，如不确定，请仅使用以下转动：',
    ],
  },
  en: {
    roundValue: '{number}', attemptValue: '{number}',
    title: 'Fewest Moves', rulesError: 'The rules and notation do not fit on the worksheet.', tooLong: ' is too long. Please shorten it before exporting.', scrambleError: 'The scramble exceeds three lines. Shorten it before exporting.', cubeLabel: 'Unfolded cube state', previewLabel: 'A4 Fewest Moves worksheet preview', competition: 'Competition', round: 'Round', attempt: 'Attempt', name: 'Competitor', id: 'WCA ID',
    grading: 'DO NOT FILL IF YOU ARE THE COMPETITOR.', graded: 'Graded by', result: 'Result', scramble: 'Scramble',
    faces: 'Face Moves', rotations: 'Rotations', clockwise: 'Clockwise', counter: 'Counter-clockwise', double: 'Double',
    rules: [
      'You have 60 minutes to find and write a solution.',
      'Write 1 move per bar. To delete a move, clearly blacken it.',
      'Your solution must not be directly derived from any part of the scrambling algorithm.',
      'Your solution must be at most 80 moves, including rotations.',
      'Your result will be counted in OBTM.',
      'Use only notation from Article 12 of the WCA Regulations. If you are uncertain, use only the exact moves listed here:',
    ],
  },
};


export { SHEET, translate, localizeDOM };
