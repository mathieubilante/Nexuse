import ModuleShell from '../components/ModuleShell.jsx'
import { MODULES } from '../data/modules.js'

export default function Aia() {
  const module = MODULES.find((m) => m.id === 'aia')
  return (
    <ModuleShell module={module}>
      <div className="mshell-placeholder">
        <h2>En construction</h2>
        <p>
          L'espace AIA (assistant general, chat, compte dedie) sera
          construit ici.
        </p>
      </div>
    </ModuleShell>
  )
}
