#-*- coding: utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import re
import pip

def install(package):
    pip.main(['install', package])

install('pyphen')    
import pyphen

pyphen.language_fallback('nl_NL_variant1')
dic = pyphen.Pyphen(lang='nl_NL')
#dic.inserted('lettergrepen')

def upper_repl(match): 
        return match.group(1) + match.group(2).upper()
    
def toNew(mystr):
    string=mystr
    newString =u''
    sp=re.split('(\W+|\w+)', string)
    words = []
    nonWords= []
    for w in sp:
        if bool(re.match('\w+',w)):
            if len(w) > 5:
                newW= dic.inserted(w)
                #newW=re.sub(r'(?:-|)(\w+)-(\w+)', r'\1<span style="font-size: 20px;">\2</span>',newW)
                newW=re.sub(r'(\w+)-(\w+)(?:-|)',upper_repl, newW)
                newString += newW
                words.append(newW)
            else:
                newString += w
                words.append(w)
                
        else:
            nonWords.append(w)
            newString += w
    return unicode(newString)

if __name__ == "__main__":
    print(toNew(u"Europeans are heading to Charleston because they've heard about the food and the architecture. It's getting great press, and it's having a moment."))
