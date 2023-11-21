set wshshell = wscript.CreateObject("wscript.shell")
wshshell.run "Notepad"
wscript.sleep 2000
wshshell.AppActivate "Notepad"
do
WshShell.SendKeys "%{F4}{END}"
WScript.Sleep 500
loop