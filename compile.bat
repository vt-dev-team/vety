::nuitka --mingw64 --standalone --windows-disable-console --show-progress --show-memory --include-package=PyQt5 --plugin-enable=qt-plugins --include-qt-plugins=sensible,styles --output-dir=releases --windows-icon-from-ico=./imgs/logo.ico main.py
nuitka --mingw64 --standalone --windows-disable-console --show-progress --show-memory --include-package=PySide6 --enable-plugin=pyside6 --include-qt-plugins=sensible,styles --output-dir=releases --nofollow-imports --follow-import-to=libs --windows-icon-from-ico=./main/imgs/logo.ico vety-qt6.py
