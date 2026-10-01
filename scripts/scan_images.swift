import Foundation
import Vision
import AppKit

let args = Array(CommandLine.arguments.dropFirst())
guard args.count >= 2 else {
    fputs("Usage: scan_images DIRECTORY_OR_LIST TERM [TERM ...] [--accurate]\n", stderr)
    exit(1)
}
let accurate = args.contains("--accurate")
let input = URL(fileURLWithPath: args[0])
let terms = args.dropFirst().filter { $0 != "--accurate" }.map { $0.lowercased() }
let fm = FileManager.default
let keys: [URLResourceKey] = [.isRegularFileKey]
let isDirectory = (try? input.resourceValues(forKeys: [.isDirectoryKey]).isDirectory) ?? false
let candidates: [URL]
if isDirectory {
    candidates = fm.enumerator(at: input, includingPropertiesForKeys: keys)!.allObjects as? [URL] ?? []
} else {
    candidates = ((try? String(contentsOf: input, encoding: .utf8)) ?? "").split(separator: "\n").map { URL(fileURLWithPath: String($0)) }
}
let files = candidates.filter {
    ["jpg", "jpeg", "png", "webp", "gif"].contains($0.pathExtension.lowercased())
}
var checked = 0
for file in files {
    autoreleasepool {
        let request = VNRecognizeTextRequest()
        request.recognitionLevel = accurate ? .accurate : .fast
        request.usesLanguageCorrection = false
        do {
            try VNImageRequestHandler(url: file).perform([request])
            let found = (request.results ?? []).compactMap { $0.topCandidates(1).first?.string }.joined(separator: " ").lowercased()
            if terms.contains(where: { found.contains($0) }) {
                print(file.path)
            }
        } catch { }
        checked += 1
        if checked % 100 == 0 { fputs("checked \(checked)/\(files.count)\n", stderr) }
    }
}
