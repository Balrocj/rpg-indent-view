import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.openAndReindent', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No file is currently open');
            return;
        }

        const document = editor.document;
        const text = document.getText();

        // Aplicar indentación solo dentro de los bloques IF y ENDIF
        const reindentedText = indentRpgCode(text);

		const uri = vscode.Uri.parse('untitled:Reindented_' + document.fileName);

        // Crear un nuevo documento con el texto reindentado
        const newDoc = await vscode.workspace.
		 openTextDocument({ content: reindentedText });
        
        // Mostrar el nuevo documento en modo preview
        await vscode.window.showTextDocument(newDoc, { preview: true });

		
    });

    context.subscriptions.push(disposable);
}

function indentRpgCode(text: string): string {
    const lines = text.split('\n');
	let indentLevel = 0;  
    const indent = '|  ';
    const indentPosition = 27; // Posición donde se insertará la indentación

    // Array de etiquetas a buscar
	const regexAddIndent = /^(.{5}C[^*].{20})(IF|DO)/i;
	const regexAddRmvIndent = /^(.{5}C[^*].{20})(ELSE)/i;
	const regexRmvIndent = /^(.{5}C[^*].{20})END/i;

    const processedLines = lines.map(line => {
		if (line.charAt(6) === '*') {
            return line;
        }
		else if (regexAddIndent.test(line)) {
            const currentLine = line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
            indentLevel++; // Incrementa el nivel de indentación después de procesar la línea
            return currentLine;
        }
		else if (regexRmvIndent.test(line)) {
            indentLevel = Math.max(0, indentLevel - 1); // Decrementa el nivel de indentación antes de procesar la línea
            return line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
        }
		else if (regexAddRmvIndent.test(line)) {
            indentLevel = Math.max(0, indentLevel - 1); // Decrementa el nivel de indentación antes de procesar la línea
            const currentLine = line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
			indentLevel++;
			return currentLine;
        }
		else {
            return line.slice(0, indentPosition) + indent.repeat(indentLevel) + line.slice(indentPosition);
        }
	});

    return processedLines.join('\n');
}

export function deactivate() {}
  