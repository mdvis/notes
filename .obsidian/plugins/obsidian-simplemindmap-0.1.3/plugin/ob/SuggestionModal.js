import { SuggestModal } from 'obsidian'

export class SuggestionModal extends SuggestModal {
  constructor({ plugin, app, getSuggestions, onSelect, type }) {
    super(app)
    this.plugin = plugin
    this.emptyStateText = this.plugin._t('tip.noMatchResult')
    this.type = type // folder（选择目录）
    if (this.type === 'folder') {
      this.getSuggestions = this._queryFolders.bind(this)
    } else {
      this.getSuggestions = getSuggestions
    }
    this.onSelect = onSelect
  }

  // 查询目录
  _queryFolders(query) {
    const list = this.app.vault.getAllFolders()
    return list
      .filter(item => {
        return item.path.toLowerCase().includes(query)
      })
      .map(item => {
        return item.path
      })
  }

  getSuggestions(query) {
    return this.getSuggestions(query)
  }

  renderSuggestion(suggestion, el) {
    el.createEl('div', { text: suggestion })
  }

  onChooseSuggestion(suggestion) {
    this.onSelect(suggestion)
  }
}
