{\rtf1\ansi\ansicpg936\cocoartf2869
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 import streamlit as st\
import time\
from difflib import SequenceMatcher\
from datetime import datetime, timedelta\
import re\
\
# \uc0\u39029 \u38754 \u37197 \u32622 \
st.set_page_config(\
    page_title="\uc0\u22270 \u23567 \u21161 -\u20869 \u24072 \u22823 \u22270 \u20070 \u39302 AI\u21161 \u25163 ",\
    page_icon="\uc0\u55357 \u56538 ",\
    layout="wide",\
    initial_sidebar_state="expanded"\
)\
\
# \uc0\u36229 \u32654 \u35266 \u33258 \u23450 \u20041 CSS\
st.markdown('''\
<style>\
/* \uc0\u20840 \u23616 \u32972 \u26223  */\
.stApp \{\
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);\
\}\
/* \uc0\u26631 \u31614 \u39029  */\
.stTabs [data-baseweb="tab-list"] \{\
    gap: 10px;\
    justify-content: center;\
    margin-bottom: 20px;\
\}\
.stTabs [data-baseweb="tab"] \{\
    border-radius: 15px;\
    padding: 10px 20px;\
    background: white;\
    border: none;\
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);\
    transition: all 0.2s;\
\}\
.stTabs [aria-selected="true"] \{\
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\
    color: white !important;\
\}\
/* \uc0\u32842 \u22825 \u23481 \u22120  */\
.chat-container \{\
    max-width: 800px;\
    margin: 0 auto;\
    padding: 20px;\
\}\
/* \uc0\u29992 \u25143 \u28040 \u24687  */\
.user-message \{\
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\
    color: white;\
    padding: 15px 20px;\
    border-radius: 20px 20px 0 20px;\
    margin: 10px 0;\
    margin-left: auto;\
    max-width: 70%;\
    text-align: left;\
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);\
\}\
/* AI\uc0\u28040 \u24687  */\
.assistant-message \{\
    background: white;\
    padding: 15px 20px;\
    border-radius: 20px 20px 20px 0;\
    margin: 10px 0;\
    margin-right: auto;\
    max-width: 70%;\
    text-align: left;\
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);\
\}\
/* \uc0\u25353 \u38062 \u26679 \u24335  */\
.stButton>button \{\
    border-radius: 12px;\
    border: none;\
    padding: 8px 12px;\
    font-size: 13px;\
    background: white;\
    color: #2c3e50;\
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);\
    transition: all 0.2s;\
\}\
.stButton>button:hover \{\
    background: #667eea;\
    color: white;\
    transform: translateY(-2px);\
\}\
/* \uc0\u36755 \u20837 \u26694  */\
.stChatInput>div>div>input \{\
    border-radius: 25px;\
    padding: 15px 20px;\
    border: 1px solid #e0e0e0;\
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);\
\}\
/* \uc0\u21345 \u29255 \u26679 \u24335  */\
.card \{\
    background: white;\
    padding: 20px;\
    border-radius: 15px;\
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);\
    margin: 10px 0;\
    transition: all 0.2s;\
\}\
.card:hover \{\
    transform: translateY(-2px);\
    box-shadow: 0 6px 16px rgba(0,0,0,0.1);\
\}\
.copy-btn \{\
    background: #f0f0f0;\
    border: none;\
    border-radius: 8px;\
    padding: 4px 8px;\
    font-size: 12px;\
    cursor: pointer;\
    margin-top: 8px;\
    float: right;\
\}\
.copy-btn:hover \{\
    background: #667eea;\
    color: white;\
\}\
.mongol-badge \{\
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);\
    color: white;\
    padding: 3px 8px;\
    border-radius: 10px;\
    font-size: 12px;\
\}\
.feedback-btn \{\
    display: flex;\
    gap: 10px;\
    margin-top: 10px;\
\}\
</style>\
''', unsafe_allow_html=True)\
\
# \uc0\u21021 \u22987 \u21270 \u20250 \u35805 \u29366 \u24577 \
if "messages" not in st.session_state:\
    st.session_state.messages = []\
if "custom_kb" not in st.session_state:\
    st.session_state.custom_kb = \{\}\
if "feedback" not in st.session_state:\
    st.session_state.feedback = 0\
\
# \uc0\u27169 \u25311 \u25968 \u25454 \
book_collection = \{\
    "\uc0\u19977 \u20307 ": \{"floor": "\u19977 \u27004 \u25991 \u23398 \u21306 ", "status": "\u22312 \u26550 \u21487 \u20511 ", "location": "3F-A12"\},\
    "\uc0\u27963 \u30528 ": \{"floor": "\u20108 \u27004 \u31038 \u31185 \u21306 ", "status": "\u24050 \u20511 \u20986 ", "location": "2F-B05", "return_date": "2026-03-28"\},\
    "\uc0\u28145 \u24230 \u23398 \u20064 ": \{"floor": "\u20116 \u27004 \u31185 \u25216 \u21306 ", "status": "\u22312 \u26550 \u21487 \u20511 ", "location": "5F-C08"\},\
    "\uc0\u24179 \u20961 \u30340 \u19990 \u30028 ": \{"floor": "\u19977 \u27004 \u25991 \u23398 \u21306 ", "status": "\u22312 \u26550 \u21487 \u20511 ", "location": "3F-A15"\},\
    "Python\uc0\u32534 \u31243 ": \{"floor": "\u20116 \u27004 \u31185 \u25216 \u21306 ", "status": "\u24050 \u20511 \u20986 ", "return_date": "2026-04-02"\},\
    "\uc0\u33945 \u21476 \u31192 \u21490 ": \{"floor": "\u20108 \u27004 \u27665 \u26063 \u25991 \u29486 \u21306 ", "status": "\u22312 \u26550 \u21487 \u20511 ", "location": "2F-D01"\},\
\}\
\
seat_status = \{\
    "\uc0\u19968 \u27004 \u33258 \u20064 \u21306 ": \{"total": 80, "left": 12, "full": False\},\
    "\uc0\u20108 \u27004 \u33258 \u20064 \u21306 ": \{"total": 100, "left": 3, "full": True\},\
    "\uc0\u19977 \u27004 \u33258 \u20064 \u21306 ": \{"total": 120, "left": 25, "full": False\},\
    "\uc0\u20116 \u27004 \u30740 \u35752 \u23460 ": \{"total": 10, "left": 2, "full": False\},\
\}\
\
new_books = [\
    \{"name": "\uc0\u38271 \u23433 \u30340 \u33620 \u26525 ", "author": "\u39532 \u20271 \u24248 ", "floor": "\u19977 \u27004 \u25991 \u23398 \u21306 "\},\
    \{"name": "DeepLearning\uc0\u20837 \u38376 ", "author": "Ian Goodfellow", "floor": "\u20116 \u27004 \u31185 \u25216 \u21306 "\},\
    \{"name": "\uc0\u39069 \u23572 \u21476 \u32435 \u27827 \u21491 \u23736 ", "author": "\u36831 \u23376 \u24314 ", "floor": "\u19977 \u27004 \u25991 \u23398 \u21306 "\},\
    \{"name": "\uc0\u33945 \u21476 \u25991 \u21270 \u30740 \u31350 ", "author": "\u20869 \u33945 \u21476 \u20154 \u27665 \u20986 \u29256 \u31038 ", "floor": "\u20108 \u27004 \u27665 \u26063 \u21306 "\},\
]\
\
# \uc0\u23436 \u25972 \u30340 \u21452 \u35821 \u30693 \u35782 \u24211 \u65292 \u34917 \u20840 \u20102 \u33945 \u35821 \u30340 \u24120 \u29992 \u38382 \u39064 \u65281 \
default_kb = \{\
    # \uc0\u20013 \u25991 \u24120 \u29992 \u38382 \u39064 \
    "\uc0\u22270 \u20070 \u39302 \u24320 \u25918 \u26102 \u38388 ": "\u22270 \u20070 \u39302 \u30340 \u24320 \u25918 \u26102 \u38388 \u26159 \u65306 \u21608 \u19968 \u33267 \u21608 \u26085  8:00-22:00\u65292 \u27861 \u23450 \u33410 \u20551 \u26085 \u20250 \u35843 \u25972 \u20026 9:00-17:00\u65292 \u20855 \u20307 \u35831 \u20851 \u27880 \u23448 \u32593 \u36890 \u30693 \u12290 ",\
    "\uc0\u22270 \u20070 \u39302 \u20960 \u28857 \u20851 \u38376 ": "\u22270 \u20070 \u39302 \u30340 \u20851 \u38376 \u26102 \u38388 \u26159 22:00\u65292 \u21608 \u19968 \u21040 \u21608 \u26085 \u37117 \u26159 \u65292 \u27861 \u23450 \u33410 \u20551 \u26085 \u26159 17:00\u20851 \u38376 \u21734 \u12290 ",\
    "\uc0\u22270 \u20070 \u39302 \u26377 \u27809 \u26377 WiFi": "\u26377 \u30340 \u65281 \u22270 \u20070 \u39302 \u35206 \u30422 \u20102 \u26657 \u22253 WiFi\u65292 \u20320 \u21487 \u20197 \u36830 \u25509 \u12300 \u20869 \u24072 \u22823 -WiFi\u12301 \u65292 \u29992 \u20320 \u30340 \u26657 \u22253 \u36134 \u21495 \u30331 \u24405 \u23601 \u33021 \u29992 \u20102 \u65281 ",\
    "WiFi\uc0\u24590 \u20040 \u36830 ": "\u20320 \u21487 \u20197 \u25628 \u32034 WiFi\u21517 \u31216 \u12300 \u20869 \u24072 \u22823 -WiFi\u12301 \u65292 \u28982 \u21518 \u29992 \u20320 \u30340 \u26657 \u22253 \u36134 \u21495 \u21644 \u23494 \u30721 \u30331 \u24405 \u65292 \u23601 \u33021 \u20813 \u36153 \u20351 \u29992 \u20102 \u65281 ",\
    "\uc0\u22270 \u20070 \u20511 \u38405 \u26399 \u38480 \u26159 \u22810 \u20037 ": "\u26222 \u36890 \u20013 \u25991 \u22270 \u20070 \u30340 \u20511 \u38405 \u26399 \u38480 \u26159 30\u22825 \u65292 \u22806 \u25991 \u22270 \u20070 \u12289 \u28909 \u38376 \u30021 \u38144 \u20070 \u30340 \u20511 \u38405 \u26399 \u38480 \u26159 15\u22825 \u65292 \u26399 \u21002 \u21512 \u35746 \u26412 \u26159 7\u22825 \u12290 ",\
    "\uc0\u24590 \u20040 \u32493 \u20511 \u22270 \u20070 ": "\u24744 \u26377 4\u31181 \u26041 \u24335 \u32493 \u20511 \u65306 1. \u22270 \u20070 \u39302 \u23448 \u32593 \u30331 \u24405 \u20010 \u20154 \u20013 \u24515 \u25805 \u20316 \u65307 2. \u24494 \u20449 \u20844 \u20247 \u21495 \u12300 \u20869 \u24072 \u22823 \u22270 \u20070 \u39302 \u12301 \u21150 \u29702 \u65307 3. \u33258 \u21161 \u20511 \u36824 \u26426 \u19978 \u25805 \u20316 \u65307 4. \u21040 \u21069 \u21488 \u25214 \u24037 \u20316 \u20154 \u21592 \u21150 \u29702 \u12290 \u32493 \u20511 \u26399 \u38480 \u20026 15\u22825 \u65292 \u27599 \u26412 \u20070 \u26368 \u22810 \u32493 \u20511 1\u27425 \u12290 ",\
    "\uc0\u36926 \u26399 \u32602 \u27454 \u24590 \u20040 \u31639 ": "\u22270 \u20070 \u36926 \u26399 \u26410 \u36824 \u30340 \u35805 \u65292 \u27599 \u26412 \u27599 \u22825 \u32602 \u27454 0.1\u20803 \u65292 \u21333 \u26412 \u22270 \u20070 \u26368 \u39640 \u32602 \u27454 \u19981 \u36229 \u36807 \u22270 \u20070 \u21407 \u20215 \u12290 \u36926 \u26399 \u36229 \u36807 90\u22825 \u65292 \u20250 \u26242 \u20572 \u24744 \u30340 \u20511 \u38405 \u26435 \u38480 \u12290 ",\
    "\uc0\u24590 \u20040 \u20511 \u20070 ": "\u24744 \u21487 \u20197 \u25658 \u24102 \u26657 \u22253 \u21345 /\u35835 \u32773 \u35777 \u65292 \u21040 \u33258 \u21161 \u20511 \u36824 \u26426 \u19978 \u25195 \u25551 \u22270 \u20070 \u21644 \u35777 \u20214 \u65292 \u25353 \u29031 \u25552 \u31034 \u25805 \u20316 \u21363 \u21487 \u65292 \u20063 \u21487 \u20197 \u21040 \u21069 \u21488 \u20154 \u24037 \u21150 \u29702 \u12290 ",\
    "\uc0\u24590 \u20040 \u36824 \u20070 ": "\u36824 \u20070 \u21487 \u20197 \u22312 \u33258 \u21161 \u20511 \u36824 \u26426 \u19978 \u25805 \u20316 \u65292 \u20063 \u21487 \u20197 \u25918 \u21040 \u38376 \u21475 \u30340 24\u23567 \u26102 \u36824 \u20070 \u31665 \u65292 \u25110 \u32773 \u21040 \u21069 \u21488 \u21150 \u29702 \u12290 ",\
    "\uc0\u26368 \u22810 \u33021 \u20511 \u20960 \u26412 \u20070 ": "\u26412 \u31185 \u29983 \u35835 \u32773 \u26368 \u22810 \u21487 \u20511 10\u26412 \u65292 \u30740 \u31350 \u29983 \u26368 \u22810 \u21487 \u20511 15\u26412 \u65292 \u25945 \u24072 \u26368 \u22810 \u21487 \u20511 20\u26412 \u65292 \u20511 \u38405 \u24635 \u26102 \u38271 \u19981 \u36229 \u36807 60\u22825 \u12290 ",\
    "\uc0\u33258 \u20064 \u23460 \u24590 \u20040 \u39044 \u32422 ": "\u24744 \u21487 \u20197 \u36890 \u36807 \u22270 \u20070 \u39302 \u23448 \u32593 \u12289 \u24494 \u20449 \u20844 \u20247 \u21495 \u30340 \u12300 \u24231 \u20301 \u39044 \u32422 \u12301 \u31995 \u32479 \u65292 \u25552 \u21069 1-3\u22825 \u39044 \u32422 \u33258 \u20064 \u23460 \u24231 \u20301 \u65292 \u39044 \u32422 \u25104 \u21151 \u21518 \u20973 \u39044 \u32422 \u30721 \u20837 \u24231 \u65292 \u36229 \u26102 15\u20998 \u38047 \u26410 \u21040 \u20250 \u33258 \u21160 \u21462 \u28040 \u39044 \u32422 \u12290 ",\
    "\uc0\u33258 \u20064 \u23460 \u21487 \u20197 \u21344 \u24231 \u21527 ": "\u22270 \u20070 \u39302 \u31105 \u27490 \u21344 \u24231 \u65292 \u31163 \u24320 \u24231 \u20301 \u36229 \u36807 30\u20998 \u38047 \u65292 \u20854 \u20182 \u35835 \u32773 \u21487 \u20197 \u20351 \u29992 \u35813 \u24231 \u20301 \u65292 \u36829 \u35268 \u21344 \u24231 \u20250 \u34987 \u26242 \u20572 \u39044 \u32422 \u26435 \u38480 \u12290 ",\
    "\uc0\u33258 \u20064 \u23460 \u26377 \u30005 \u28304 \u21527 ": "\u33258 \u20064 \u23460 \u30340 \u27599 \u20010 \u24231 \u20301 \u37117 \u37197 \u26377 \u30005 \u28304 \u25554 \u24231 \u21644 USB\u25509 \u21475 \u65292 \u24744 \u21487 \u20197 \u32473 \u30005 \u33041 \u12289 \u25163 \u26426 \u20805 \u30005 \u12290 ",\
    "\uc0\u33258 \u20064 \u23460 \u21487 \u20197 \u21507 \u19996 \u35199 \u21527 ": "\u33258 \u20064 \u23460 \u31105 \u27490 \u39278 \u39135 \u65292 \u24744 \u21487 \u20197 \u21040 \u19968 \u27004 \u30340 \u20241 \u38386 \u21306 \u29992 \u39184 \u12290 ",\
    "\uc0\u30005 \u23376 \u22270 \u20070 \u24590 \u20040 \u19979 \u36733 ": "\u24744 \u21487 \u20197 \u30331 \u24405 \u22270 \u20070 \u39302 \u30340 \u25968 \u23383 \u36164 \u28304 \u24179 \u21488 \u65292 \u25214 \u21040 \u23545 \u24212 \u30340 \u30005 \u23376 \u22270 \u20070 \u65292 \u28857 \u20987 \u19979 \u36733 \u21363 \u21487 \u65292 \u37096 \u20998 \u36164 \u28304 \u38656 \u35201 \u22312 \u39302 \u20869 IP\u35775 \u38382 \u65292 \u26657 \u22806 \u21487 \u20197 \u36890 \u36807 VPN\u35775 \u38382 \u12290 ",\
    "\uc0\u24590 \u20040 \u30475 \u30693 \u32593 \u35770 \u25991 ": "\u24744 \u21487 \u20197 \u36890 \u36807 \u22270 \u20070 \u39302 \u23448 \u32593 \u30340 \u12300 \u25968 \u23383 \u36164 \u28304 \u12301 \u20837 \u21475 \u36827 \u20837 \u30693 \u32593 \u65292 \u30331 \u24405 \u21518 \u21363 \u21487 \u19979 \u36733 \u35770 \u25991 \u65292 \u26657 \u22806 \u21487 \u20197 \u36890 \u36807 VPN\u35775 \u38382 \u12290 ",\
    "\uc0\u25968 \u25454 \u24211 \u24590 \u20040 \u29992 ": "\u22270 \u20070 \u39302 \u36141 \u20080 \u20102 \u30693 \u32593 \u12289 \u19975 \u26041 \u12289 \u32500 \u26222 \u12289 Web of Science\u31561 \u20960 \u21313 \u20010 \u25968 \u25454 \u24211 \u65292 \u24744 \u21487 \u20197 \u22312 \u23448 \u32593 \u30340 \u25968 \u23383 \u36164 \u28304 \u39029 \u38754 \u25214 \u21040 \u20837 \u21475 \u65292 \u22312 \u26657 \u20869 \u30452 \u25509 \u35775 \u38382 \u65292 \u26657 \u22806 \u29992 VPN\u12290 ",\
    "\uc0\u24590 \u20040 \u21150 \u29702 \u35835 \u32773 \u35777 ": "\u26412 \u26657 \u24072 \u29983 \u20973 \u26657 \u22253 \u21345 \u30452 \u25509 \u23601 \u33021 \u29992 \u65292 \u19981 \u29992 \u39069 \u22806 \u21150 \u35777 \u65307 \u26657 \u22806 \u35835 \u32773 \u21487 \u20197 \u25658 \u24102 \u36523 \u20221 \u35777 \u21040 \u21069 \u21488 \u21150 \u29702 \u20020 \u26102 \u35835 \u32773 \u35777 \u65292 \u25276 \u37329 100\u20803 \u12290 ",\
    "\uc0\u35835 \u32773 \u35777 \u20002 \u20102 \u24590 \u20040 \u21150 ": "\u24744 \u21487 \u20197 \u21040 \u21069 \u21488 \u21150 \u29702 \u25346 \u22833 \u65292 \u25346 \u22833 \u21518 7\u22825 \u21487 \u20197 \u34917 \u21150 \u26032 \u35777 \u65292 \u20063 \u21487 \u20197 \u22312 \u23448 \u32593 \u30340 \u20010 \u20154 \u20013 \u24515 \u22312 \u32447 \u25346 \u22833 \u12290 ",\
    "\uc0\u23494 \u30721 \u24536 \u20102 \u24590 \u20040 \u21150 ": "\u24744 \u21487 \u20197 \u22312 \u23448 \u32593 \u30340 \u30331 \u24405 \u39029 \u38754 \u28857 \u20987 \u12300 \u24536 \u35760 \u23494 \u30721 \u12301 \u65292 \u36890 \u36807 \u25163 \u26426 \u21495 /\u37038 \u31665 \u37325 \u32622 \u65292 \u20063 \u21487 \u20197 \u21040 \u21069 \u21488 \u37325 \u32622 \u12290 ",\
    "\uc0\u22270 \u20070 \u39302 \u21487 \u20197 \u25171 \u21360 \u22797 \u21360 \u21527 ": "\u19968 \u27004 \u22823 \u21381 \u26377 \u33258 \u21161 \u25171 \u21360 \u22797 \u21360 \u19968 \u20307 \u26426 \u65292 \u25903 \u25345 \u25195 \u30721 \u25903 \u20184 \u65292 \u25171 \u21360 0.1\u20803 /\u24352 \u65292 \u22797 \u21360 0.1\u20803 /\u24352 \u12290 ",\
    "\uc0\u21487 \u20197 \u24102 \u21253 \u36827 \u22270 \u20070 \u39302 \u21527 ": "\u21487 \u20197 \u30340 \u65292 \u24744 \u21487 \u20197 \u24102 \u21253 \u36827 \u20837 \u65292 \u20294 \u26159 \u31105 \u27490 \u25658 \u24102 \u39135 \u21697 \u12289 \u39278 \u26009 \u65292 \u31105 \u27490 \u22823 \u22768 \u21927 \u21719 \u12290 ",\
    "\uc0\u26032 \u20070 \u24590 \u20040 \u26597 \u35810 ": "\u24744 \u21487 \u20197 \u22312 \u22270 \u20070 \u39302 \u23448 \u32593 \u30340 \u39302 \u34255 \u26597 \u35810 \u31995 \u32479 \u65292 \u25628 \u32034 \u20070 \u21517 \u12289 \u20316 \u32773 \u65292 \u23601 \u33021 \u26597 \u21040 \u36825 \u26412 \u20070 \u26377 \u27809 \u26377 \u39302 \u34255 \u65292 \u22312 \u21738 \u20010 \u20070 \u26550 \u65292 \u26159 \u21542 \u21487 \u20511 \u12290 ",\
    "\uc0\u22270 \u20070 \u39302 \u26377 \u30740 \u35752 \u23460 \u21527 ": "\u26377 \u30340 \u65292 \u19977 \u27004 \u26377 10\u20010 \u30740 \u35752 \u23460 \u65292 \u24744 \u21487 \u20197 \u25552 \u21069 \u39044 \u32422 \u65292 \u26368 \u22810 8\u20154 \u20351 \u29992 \u65292 \u26102 \u38271 \u19981 \u36229 \u36807 4\u23567 \u26102 \u12290 ",\
    "\uc0\u21040 \u26399 \u25552 \u37266 ": "\u20320 \u21487 \u20197 \u21578 \u35785 \u25105 \u20320 \u30340 \u20511 \u38405 \u26085 \u26399 \u65292 \u25105 \u24110 \u20320 \u31639 \u20160 \u20040 \u26102 \u20505 \u21040 \u26399 \u21734 \u65281 \u27604 \u22914 \u36755 \u20837 \u12300 \u25105 3\u26376 20\u21495 \u20511 \u30340 \u20070 \u12301 ",\
    # \uc0\u21151 \u33021 \u31867 \u38382 \u39064 \
    "\uc0\u26412 \u21608 \u26377 \u20160 \u20040 \u26032 \u20070 ": "\u26412 \u21608 \u26032 \u21040 \u20102 4\u26412 \u22909 \u20070 \u21734 \u65306 \\n1. \u12298 \u38271 \u23433 \u30340 \u33620 \u26525 \u12299 - \u39532 \u20271 \u24248 \u65292 \u19977 \u27004 \u25991 \u23398 \u21306 \\n2. \u12298 DeepLearning\u20837 \u38376 \u12299 - Ian Goodfellow\u65292 \u20116 \u27004 \u31185 \u25216 \u21306 \\n3. \u12298 \u39069 \u23572 \u21476 \u32435 \u27827 \u21491 \u23736 \u12299 - \u36831 \u23376 \u24314 \u65292 \u19977 \u27004 \u25991 \u23398 \u21306 \\n4. \u12298 \u33945 \u21476 \u25991 \u21270 \u30740 \u31350 \u12299 - \u20869 \u33945 \u21476 \u20154 \u27665 \u20986 \u29256 \u31038 \u65292 \u20108 \u27004 \u27665 \u26063 \u21306 ",\
    "\uc0\u36824 \u26377 \u31354 \u20301 \u21527 ": "\u21508 \u27004 \u23618 \u21097 \u20313 \u31354 \u20301 \u24773 \u20917 \u65306 \\n- \u19968 \u27004 \u33258 \u20064 \u21306 \u65306 \u21097 \u20313 12\u20010 \u31354 \u20301 \\n- \u20108 \u27004 \u33258 \u20064 \u21306 \u65306 \u21097 \u20313 3\u20010 \u31354 \u20301 \u65292 \u21363 \u23558 \u28385 \u24231 \\n- \u19977 \u27004 \u33258 \u20064 \u21306 \u65306 \u21097 \u20313 25\u20010 \u31354 \u20301 \\n- \u20116 \u27004 \u30740 \u35752 \u23460 \u65306 \u21097 \u20313 2\u20010 \u31354 \u20301 ",\
    # \uc0\u33945 \u35821 \u38382 \u39064 \u65292 \u34917 \u20840 \u20102 \u24120 \u29992 \u30340 \u65281 \
    "\uc0\u1085 \u1086 \u1084  \u1093 \u1101 \u1088 \u1093 \u1101 \u1085  \u1089 \u1091 \u1085 \u1075 \u1072 \u1093  \u1074 \u1101 ?": "\u1058 \u1072  4 \u1072 \u1088 \u1075 \u1072 \u1072 \u1088  \u1085 \u1086 \u1084  \u1089 \u1091 \u1085 \u1075 \u1072 \u1078  \u1073 \u1086 \u1083 \u1085 \u1086 : 1. \u1053 \u1086 \u1084 \u1099 \u1085  \u1089 \u1072 \u1085 \u1075 \u1080 \u1081 \u1085  \u1074 \u1101 \u1073  \u1089 \u1072 \u1081 \u1090  \u1076 \u1101 \u1101 \u1088  \u1093 \u1091 \u1074 \u1080 \u1081 \u1085  \u1090 \u1257 \u1074 \u1076 \u1257 \u1257  \u1086 \u1088 \u1086 \u1086 \u1076  \u1072 \u1078 \u1080 \u1083 \u1083 \u1091 \u1091 \u1083 \u1072 \u1093 ; 2. \'ab\u1044 \u1086 \u1090 \u1086 \u1086 \u1076 \u1099 \u1085  \u1080 \u1093  \u1089 \u1091 \u1088 \u1075 \u1091 \u1091 \u1083 \u1080 \u1081 \u1085  \u1085 \u1086 \u1084 \u1099 \u1085  \u1089 \u1072 \u1085 \'bb \u1093 \u1101 \u1084 \u1101 \u1101 \u1093  WeChat \u1072 \u1083 \u1073 \u1072 \u1085  \u1105 \u1089 \u1085 \u1099  \u1076 \u1072 \u1085 \u1089 \u1072 \u1072 \u1088  \u1076 \u1072 \u1084 \u1078 \u1091 \u1091 \u1083 \u1072 \u1085 ; 3. \u1256 \u1257 \u1088 \u1257 \u1257  \u1072 \u1078 \u1080 \u1083 \u1083 \u1091 \u1091 \u1083 \u1072 \u1093  \u1084 \u1072 \u1096 \u1080 \u1085  \u1076 \u1101 \u1101 \u1088 ; 4. \u1059 \u1088 \u1076  \u1090 \u1072 \u1083 \u1099 \u1085  \u1072 \u1078 \u1080 \u1083 \u1090 \u1072 \u1085 \u1076  \u1093 \u1072 \u1085 \u1076 \u1072 \u1078  \u1073 \u1086 \u1083 \u1085 \u1086 . \u1057 \u1091 \u1085 \u1075 \u1072 \u1093  \u1093 \u1091 \u1075 \u1072 \u1094 \u1072 \u1072  15 \u1093 \u1086 \u1085 \u1086 \u1075 , \u1085 \u1086 \u1084  \u1073 \u1199 \u1088 \u1076  \u1085 \u1101 \u1075  \u1083  \u1091 \u1076 \u1072 \u1072  \u1089 \u1091 \u1085 \u1075 \u1072 \u1078  \u1073 \u1086 \u1083 \u1085 \u1086 .",\
    "\uc0\u1085 \u1086 \u1084 \u1099 \u1085  \u1089 \u1072 \u1085 \u1075 \u1080 \u1081 \u1085  \u1085 \u1101 \u1101 \u1093  \u1094 \u1072 \u1075 ": "\u1053 \u1086 \u1084 \u1099 \u1085  \u1089 \u1072 \u1085 \u1075 \u1080 \u1081 \u1085  \u1085 \u1101 \u1101 \u1093  \u1094 \u1072 \u1075 : \u1044 \u1072 \u1074 \u1072 \u1072  \u1075 \u1072 \u1088 \u1072 \u1075 \u1072 \u1072 \u1089  \u1053 \u1103 \u1084  \u1075 \u1072 \u1088 \u1072 \u1075  \u1093 \u1199 \u1088 \u1090 \u1101 \u1083  8:00-22:00, \u1093 \u1091 \u1091 \u1083 \u1100  \u1105 \u1089 \u1085 \u1099  \u1072 \u1084 \u1088 \u1072 \u1083 \u1090 \u1099 \u1085  \u1257 \u1076 \u1088 \u1199 \u1199 \u1076 \u1101 \u1076  9:00-17:00 \u1073 \u1086 \u1083 \u1085 \u1086 . \u1044 \u1101 \u1083 \u1075 \u1101 \u1088 \u1101 \u1085 \u1075 \u1199 \u1081 \u1075  \u1074 \u1101 \u1073  \u1089 \u1072 \u1081 \u1090  \u1076 \u1101 \u1101 \u1088 \u1101 \u1101 \u1089  \u1093 \u1072 \u1088 \u1085 \u1072  \u1091 \u1091 .",\
    "\uc0\u1089 \u1091 \u1091 \u1076 \u1072 \u1083  \u1093 \u1101 \u1088 \u1093 \u1101 \u1085  \u1079 \u1072 \u1093 \u1080 \u1072 \u1083 \u1072 \u1093  \u1074 \u1101 ?": "\u1058 \u1072  \u1085 \u1086 \u1084 \u1099 \u1085  \u1089 \u1072 \u1085 \u1075 \u1080 \u1081 \u1085  \u1074 \u1101 \u1073  \u1089 \u1072 \u1081 \u1090 , WeChat \u1072 \u1083 \u1073 \u1072 \u1085  \u1105 \u1089 \u1085 \u1099  \u1076 \u1072 \u1085 \u1089 \u1085 \u1099  \'ab\u1089 \u1091 \u1091 \u1076 \u1072 \u1083  \u1079 \u1072 \u1093 \u1080 \u1072 \u1083 \u1072 \u1093 \'bb \u1089 \u1080 \u1089 \u1090 \u1077 \u1084 \u1101 \u1101 \u1088  \u1076 \u1072 \u1084 \u1078 \u1091 \u1091 \u1083 \u1072 \u1085 , 1-3 \u1093 \u1086 \u1085 \u1086 \u1075 \u1080 \u1081 \u1085  \u1257 \u1084 \u1085 \u1257  \u1079 \u1072 \u1093 \u1080 \u1072 \u1083 \u1078  \u1073 \u1086 \u1083 \u1085 \u1086 . \u1047 \u1072 \u1093 \u1080 \u1072 \u1083 \u1075 \u1072  \u1072 \u1084 \u1078 \u1080 \u1083 \u1090 \u1090 \u1072 \u1081  \u1073 \u1086 \u1083 \u1089 \u1085 \u1099  \u1076 \u1072 \u1088 \u1072 \u1072  \u1079 \u1072 \u1093 \u1080 \u1072 \u1083 \u1075 \u1099 \u1085  \u1082 \u1086 \u1076 \u1086 \u1086 \u1088  \u1089 \u1091 \u1091 \u1076 \u1072 \u1083 \u1076 \u1072 \u1072  \u1086 \u1088 \u1086 \u1093  \u1073 \u1086 \u1083 \u1086 \u1084 \u1078 \u1090 \u1086 \u1081 . 15 \u1084 \u1080 \u1085 \u1091 \u1090 \u1099 \u1085  \u1076 \u1086 \u1090 \u1086 \u1088  \u1080 \u1088 \u1101 \u1093 \u1075 \u1199 \u1081  \u1073 \u1086 \u1083  \u1079 \u1072 \u1093 \u1080 \u1072 \u1083 \u1075 \u1072  \u1072 \u1074 \u1090 \u1086 \u1084 \u1072 \u1090 \u1072 \u1072 \u1088  \u1094 \u1091 \u1094 \u1083 \u1072 \u1075 \u1076 \u1072 \u1085 \u1072 .",\
    "WiFi \uc0\u1103 \u1072 \u1078  \u1093 \u1086 \u1083 \u1073 \u1086 \u1093  \u1074 \u1101 ?": "\u1058 \u1072  WiFi \u1085 \u1101 \u1088  \'ab\u1044 \u1086 \u1090 \u1086 \u1086 \u1076 \u1099 \u1085  \u1080 \u1093  \u1089 \u1091 \u1088 \u1075 \u1091 \u1091 \u1083 \u1100 -WiFi\'bb \u1075 \u1101 \u1078  \u1093 \u1072 \u1081 \u1075 \u1072 \u1072 \u1076 , \u1257 \u1257 \u1088 \u1080 \u1081 \u1085  \u1089 \u1091 \u1088 \u1075 \u1091 \u1091 \u1083 \u1080 \u1081 \u1085  \u1085 \u1101 \u1088 , \u1085 \u1091 \u1091 \u1094  \u1199 \u1075 \u1101 \u1101 \u1088  \u1085 \u1101 \u1074 \u1090 \u1101 \u1088 \u1095  \u1073 \u1086 \u1083 \u1085 \u1086 ! \u1198 \u1085 \u1101 \u1075 \u1199 \u1081  \u1072 \u1096 \u1080 \u1075 \u1083 \u1072 \u1093  \u1073 \u1086 \u1083 \u1086 \u1084 \u1078 \u1090 \u1086 \u1081 !",\
    "\uc0\u1085 \u1086 \u1084 \u1099 \u1085  \u1089 \u1072 \u1085  \u1093 \u1101 \u1074 \u1083 \u1101 \u1078  \u1073 \u1086 \u1083 \u1086 \u1093  \u1091 \u1091 ?": "\u1053 \u1101 \u1075 \u1076 \u1199 \u1075 \u1101 \u1101 \u1088  \u1076 \u1072 \u1074 \u1093 \u1088 \u1099 \u1085  \u1090 \u1072 \u1085 \u1093 \u1080 \u1084 \u1076  \u1257 \u1257 \u1088 \u1257 \u1257  \u1072 \u1078 \u1080 \u1083 \u1083 \u1091 \u1091 \u1083 \u1072 \u1093  \u1093 \u1101 \u1074 \u1083 \u1101 \u1093  \u1084 \u1072 \u1096 \u1080 \u1085  \u1073 \u1072 \u1081 \u1076 \u1072 \u1075 . Scaner \u1090 \u1257 \u1083 \u1073 \u1257 \u1088  \u1093 \u1080 \u1081 \u1093  \u1073 \u1086 \u1083 \u1086 \u1084 \u1078 \u1090 \u1086 \u1081 , \u1093 \u1101 \u1074 \u1083 \u1101 \u1093  0.1 \u1102 \u1072 \u1085 \u1100 /\u1093 \u1091 \u1091 \u1076 \u1072 \u1089 , \u1093 \u1091 \u1091 \u1083 \u1073 \u1072 \u1088 \u1083 \u1072 \u1093  0.1 \u1102 \u1072 \u1085 \u1100 /\u1093 \u1091 \u1091 \u1076 \u1072 \u1089 .",\
\}\
\
def get_full_kb():\
    full_kb = default_kb.copy()\
    full_kb.update(st.session_state.custom_kb)\
    return full_kb\
\
# \uc0\u35299 \u26512 \u26085 \u26399 \u65292 \u22788 \u29702 \u21040 \u26399 \u25552 \u37266 \
def parse_date_and_remind(query):\
    # \uc0\u25552 \u21462 \u26085 \u26399 \
    # \uc0\u21305 \u37197  3\u26376 20\u21495  \u25110 \u32773  2026-03-20 \u36825 \u31181 \u26684 \u24335 \
    date_patterns = [\
        r'(\\d\{4\})-(\\d\{1,2\})-(\\d\{1,2\})',\
        r'(\\d\{1,2\})\uc0\u26376 (\\d\{1,2\})\u21495 ',\
        r'(\\d\{1,2\})\\.(\\d\{1,2\})\\.',\
    ]\
    for pattern in date_patterns:\
        match = re.search(pattern, query)\
        if match:\
            try:\
                if len(match.groups()) == 3:\
                    # \uc0\u24180 -\u26376 -\u26085 \
                    year, month, day = map(int, match.groups())\
                else:\
                    # \uc0\u26376 -\u26085 \
                    month, day = map(int, match.groups())\
                    year = datetime.now().year\
                borrow_date = datetime(year, month, day)\
                due_date = borrow_date + timedelta(days=30)\
                days_left = (due_date - datetime.now()).days\
                if days_left > 0:\
                    return f"\uc0\u20320 \u30340 \u20511 \u38405 \u26085 \u26399 \u26159 \{month\}\u26376 \{day\}\u26085 \u65292 \u21040 \u26399 \u26102 \u38388 \u26159 \{due_date.month\}\u26376 \{due_date.day\}\u26085 \u65292 \u36824 \u26377 \{days_left\}\u22825 \u21040 \u26399 \u21734 \u65281 \u21035 \u24536 \u20102 \u25552 \u21069 \u32493 \u20511 \u65292 \u19981 \u28982 \u20250 \u26377 \u36926 \u26399 \u32602 \u27454 \u30340 ~"\
                else:\
                    return f"\uc0\u20320 \u30340 \u20511 \u38405 \u26085 \u26399 \u26159 \{month\}\u26376 \{day\}\u26085 \u65292 \u24050 \u32463 \u36926 \u26399 \{-days_left\}\u22825 \u20102 \u65281 \u35831 \u23613 \u24555 \u36824 \u20070 \u65292 \u19981 \u28982 \u20250 \u24433 \u21709 \u20320 \u30340 \u20511 \u38405 \u26435 \u38480 \u21734 \u65281 "\
            except:\
                pass\
    return None\
\
# \uc0\u22788 \u29702 \u21151 \u33021 \u31867 \u30340 \u25552 \u38382 \
def handle_function_query(query):\
    query_lower = query.lower()\
    \
    # 1. \uc0\u21040 \u26399 \u25552 \u37266 \
    if "\uc0\u21040 \u26399 " in query_lower or "\u25552 \u37266 " in query_lower or "\u36824 \u20070 " in query_lower:\
        # \uc0\u20808 \u30475 \u26377 \u27809 \u26377 \u26085 \u26399 \
        date_remind = parse_date_and_remind(query)\
        if date_remind:\
            return date_remind\
        else:\
            return "\uc0\u20320 \u21487 \u20197 \u21578 \u35785 \u25105 \u20320 \u30340 \u20511 \u38405 \u26085 \u26399 \u65292 \u25105 \u24110 \u20320 \u31639 \u20160 \u20040 \u26102 \u20505 \u21040 \u26399 \u21734 \u65281 \u27604 \u22914 \u36755 \u20837 \u12300 \u25105 3\u26376 20\u21495 \u20511 \u30340 \u20070 \u12301 \u65292 \u25105 \u23601 \u20250 \u21578 \u35785 \u20320 \u36824 \u26377 \u22810 \u23569 \u22825 \u21040 \u26399 ~"\
    \
    # 2. \uc0\u26597 \u26032 \u20070 \
    if "\uc0\u26032 \u20070 " in query_lower or "\u26412 \u21608 \u26032 \u20070 " in query_lower:\
        res = "\uc0\u26412 \u21608 \u26032 \u21040 \u20102 4\u26412 \u22909 \u20070 \u21734 \u65306 \\n"\
        for book in new_books:\
            res += f"- \uc0\u12298 \{book['name']\}\u12299 - \{book['author']\}\u65292 \{book['floor']\}\\n"\
        return res\
    \
    # 3. \uc0\u26597 \u24231 \u20301 \
    if "\uc0\u24231 \u20301 " in query_lower or "\u31354 \u20301 " in query_lower or "\u33258 \u20064 \u23460 " in query_lower:\
        res = "\uc0\u21508 \u27004 \u23618 \u21097 \u20313 \u31354 \u20301 \u24773 \u20917 \u65306 \\n"\
        for floor, status in seat_status.items():\
            if status['full']:\
                res += f"- \{floor\}\uc0\u65306 \u21097 \u20313 \{status['left']\}\u20010 \u31354 \u20301 \u65292 \u21363 \u23558 \u28385 \u24231 \\n"\
            else:\
                res += f"- \{floor\}\uc0\u65306 \u21097 \u20313 \{status['left']\}\u20010 \u31354 \u20301 \\n"\
        return res\
    \
    # 4. \uc0\u26597 \u39302 \u34255 \
    for book_name in book_collection.keys():\
        if book_name in query or query in book_name:\
            info = book_collection[book_name]\
            if info['status'] == "\uc0\u22312 \u26550 \u21487 \u20511 ":\
                return f"\uc0\u12298 \{book_name\}\u12299 \u30340 \u20449 \u24687 \u65306 \\n- \u25152 \u22312 \u27004 \u23618 \u65306 \{info['floor']\}\\n- \u20855 \u20307 \u20301 \u32622 \u65306 \{info['location']\}\\n- \u21487 \u20511 \u29366 \u24577 \u65306 \u9989  \u22312 \u26550 \u21487 \u20511 "\
            else:\
                return f"\uc0\u12298 \{book_name\}\u12299 \u30340 \u20449 \u24687 \u65306 \\n- \u25152 \u22312 \u27004 \u23618 \u65306 \{info['floor']\}\\n- \u20855 \u20307 \u20301 \u32622 \u65306 \{info['location']\}\\n- \u21487 \u20511 \u29366 \u24577 \u65306 \u10060  \u24050 \u20511 \u20986 \u65292 \u39044 \u35745 \{info['return_date']\}\u24402 \u36824 "\
    \
    return None\
\
# \uc0\u27169 \u31946 \u25628 \u32034 \u21305 \u37197 \
def find_best_match(query, kb, threshold=0.4):\
    # \uc0\u20808 \u22788 \u29702 \u21151 \u33021 \u31867 \u30340 \u25552 \u38382 \
    func_answer = handle_function_query(query)\
    if func_answer:\
        return func_answer\
    \
    # \uc0\u20877 \u22788 \u29702 \u26222 \u36890 \u30340 \u30693 \u35782 \u24211 \u21305 \u37197 \
    query_lower = query.lower()\
    best_score = 0\
    best_answer = None\
    for key, answer in kb.items():\
        key_lower = key.lower()\
        if query_lower in key_lower or key_lower in query_lower:\
            return answer\
        score = SequenceMatcher(None, query_lower, key_lower).ratio()\
        if score > best_score and score > threshold:\
            best_score = score\
            best_answer = answer\
    return best_answer\
\
# \uc0\u26631 \u39064 +\u32479 \u35745 \
st.markdown('''\
<div style="text-align: center; padding: 20px 0;">\
    <h1 style="color: #2c3e50; margin: 0; font-size: 2.5em;">\uc0\u55357 \u56538  \u22270 \u23567 \u21161 </h1>\
    <p style="color: #7f8c8d; font-size: 1.2em; margin-top: 10px;">\uc0\u20869 \u24072 \u22823 \u22270 \u20070 \u39302 \u19987 \u23646 AI\u21161 \u25163 \u65292 \u19968 \u31449 \u24335 \u35299 \u20915 \u20320 \u25152 \u26377 \u38382 \u39064 \u65281 </p>\
    <div style="margin-top: 15px; display: flex; justify-content: center; gap: 30px; font-size: 14px; color: #666;">\
        <span>\uc0\u9989  \u24050 \u24110 \u21161  200+ \u21516 \u23398 \u35299 \u20915 \u38382 \u39064 </span>\
        <span>\uc0\u9201 \u65039  \u33410 \u30465  80% \u21672 \u35810 \u26102 \u38388 </span>\
        <span>\uc0\u55357 \u56520  \u26381 \u21153 \u25928 \u29575 \u25552 \u21319  100%</span>\
    </div>\
    <div style="margin-top: 10px;">\
        <span class="mongol-badge">\uc0\u55356 \u56818 \u55356 \u56819  \u25903 \u25345 \u20013 \u25991 /\u33945 \u35821 \u21452 \u35821 \u25552 \u38382 </span>\
    </div>\
</div>\
''', unsafe_allow_html=True)\
\
# \uc0\u20391 \u36793 \u26639 \
with st.sidebar:\
    st.header("\uc0\u55357 \u56481  \u24555 \u25463 \u25552 \u38382 ")\
    st.write("\uc0\u28857 \u19968 \u19979 \u23601 \u33021 \u38382 \u65292 \u19981 \u29992 \u25171 \u23383 \u65281 ")\
    \
    kb = get_full_kb()\
    quick_questions = list(kb.keys())[:10]\
    \
    # \uc0\u20998 \u31163 \u33945 \u35821 \u21644 \u26222 \u36890 \u38382 \u39064 \
    mongol_questions = []\
    normal_questions = []\
    for q in quick_questions:\
        is_mongol = False\
        for c in q:\
            if '\\u0400' <= c <= '\\u04FF':\
                is_mongol = True\
                break\
        if is_mongol:\
            mongol_questions.append(q)\
        else:\
            normal_questions.append(q)\
    \
    # \uc0\u20013 \u25991 \u24555 \u25463 \u25353 \u38062 \
    col1, col2 = st.columns(2)\
    for i, q in enumerate(normal_questions[:6]):\
        if i % 2 == 0:\
            with col1:\
                if st.button(q, key=q, use_container_width=True):\
                    st.session_state.prompt = q\
        else:\
            with col2:\
                if st.button(q, key=f"q_\{i\}", use_container_width=True):\
                    st.session_state.prompt = q\
    \
    # \uc0\u21151 \u33021 \u24555 \u25463 \u25353 \u38062 \
    st.divider()\
    st.write("\uc0\u55357 \u56589  \u21151 \u33021 \u24555 \u25463 \u25552 \u38382 ")\
    col1, col2, col3 = st.columns(3)\
    with col1:\
        if st.button("\uc0\u19977 \u20307 \u22312 \u21738 \u65311 ", key="f1", use_container_width=True):\
            st.session_state.prompt = "\uc0\u19977 \u20307 \u22312 \u21738 \u65311 "\
    with col2:\
        if st.button("\uc0\u36824 \u26377 \u31354 \u20301 \u21527 \u65311 ", key="f2", use_container_width=True):\
            st.session_state.prompt = "\uc0\u36824 \u26377 \u31354 \u20301 \u21527 \u65311 "\
    with col3:\
        if st.button("\uc0\u26412 \u21608 \u26032 \u20070 \u65311 ", key="f3", use_container_width=True):\
            st.session_state.prompt = "\uc0\u26412 \u21608 \u26377 \u20160 \u20040 \u26032 \u20070 \u65311 "\
    \
    # \uc0\u21040 \u26399 \u25552 \u37266 \u24555 \u25463 \u25353 \u38062 \
    if st.button("\uc0\u21040 \u26399 \u25552 \u37266 \u65311 ", key="f4", use_container_width=True):\
        st.session_state.prompt = "\uc0\u21040 \u26399 \u25552 \u37266 "\
    \
    # \uc0\u33945 \u35821 \u24555 \u25463 \u25353 \u38062 \
    if mongol_questions:\
        st.divider()\
        st.write("\uc0\u55356 \u56818 \u55356 \u56819  \u33945 \u35821 \u24555 \u25463 \u25552 \u38382 ")\
        col1, col2 = st.columns(2)\
        for i, q in enumerate(mongol_questions):\
            if i % 2 == 0:\
                with col1:\
                    if st.button(q, key=f"m_\{q\}", use_container_width=True):\
                        st.session_state.prompt = q\
            else:\
                with col2:\
                    if st.button(q, key=f"mq_\{i\}", use_container_width=True):\
                        st.session_state.prompt = q\
    \
    st.divider()\
    \
    if st.button("\uc0\u55357 \u56785 \u65039  \u28165 \u31354 \u32842 \u22825 \u35760 \u24405 ", use_container_width=True):\
        st.session_state.messages = []\
        st.rerun()\
    \
    st.divider()\
    \
    st.header("\uc0\u10133  \u33258 \u23450 \u20041 \u28155 \u21152 \u38382 \u39064 ")\
    new_q = st.text_input("\uc0\u38382 \u39064 ")\
    new_a = st.text_area("\uc0\u31572 \u26696 ")\
    if st.button("\uc0\u28155 \u21152 \u21040 \u30693 \u35782 \u24211 ", use_container_width=True):\
        if new_q and new_a:\
            st.session_state.custom_kb[new_q] = new_a\
            st.success("\uc0\u9989  \u28155 \u21152 \u25104 \u21151 \u65281 ")\
            st.rerun()\
\
# \uc0\u22810 \u26631 \u31614 \u39029 \
tab1, tab2, tab3, tab4 = st.tabs(["\uc0\u55357 \u56492  \u26234 \u33021 \u38382 \u31572 ", "\u55357 \u56589  \u39302 \u34255 \u26597 \u35810 ", "\u55358 \u56977  \u24231 \u20301 \u29366 \u24577 ", "\u55357 \u56534  \u26412 \u21608 \u26032 \u20070 "])\
\
# --- \uc0\u26631 \u31614 1\u65306 \u26234 \u33021 \u38382 \u31572  ---\
with tab1:\
    # \uc0\u27426 \u36814 \u24341 \u23548 \
    if len(st.session_state.messages) == 0:\
        st.markdown('''\
        <div class="card" style="text-align: center;">\
            <h3>\uc0\u55357 \u56395  \u27426 \u36814 \u20351 \u29992 \u22270 \u23567 \u21161 \u65281 </h3>\
            <p>\uc0\u25105 \u21487 \u20197 \u24110 \u20320 \u65306 </p>\
            <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 15px;">\
                <span>\uc0\u9989  \u35299 \u31572 \u22270 \u20070 \u39302 \u30340 \u25152 \u26377 \u38382 \u39064 </span>\
                <span>\uc0\u9989  \u26597 \u35810 \u22270 \u20070 \u39302 \u34255 \u20301 \u32622 </span>\
                <span>\uc0\u9989  \u26597 \u30475 \u33258 \u20064 \u23460 \u21097 \u20313 \u31354 \u20301 </span>\
                <span>\uc0\u9989  \u26597 \u30475 \u26412 \u21608 \u26032 \u20070 </span>\
                <span>\uc0\u9989  \u21040 \u26399 \u25552 \u37266 </span>\
            </div>\
            <div style="margin-top: 15px; padding: 10px; background: #f0f7ff; border-radius: 10px;">\
                <p style="margin:0; color: #2c3e50;">\uc0\u55357 \u56481  \u20320 \u19981 \u29992 \u20999 \u25442 \u26631 \u31614 \u65292 \u30452 \u25509 \u22312 \u32842 \u22825 \u37324 \u38382 \u23601 \u34892 \u65281 \u27604 \u22914 \u65306 </p>\
                <ul style="text-align: left; max-width: 500px; margin: 10px auto;">\
                    <li>\uc0\u38382 \u12300 \u19977 \u20307 \u22312 \u21738 \u65311 \u12301 \u30452 \u25509 \u26597 \u39302 \u34255 </li>\
                    <li>\uc0\u38382 \u12300 \u36824 \u26377 \u31354 \u20301 \u21527 \u65311 \u12301 \u30452 \u25509 \u30475 \u24231 \u20301 </li>\
                    <li>\uc0\u38382 \u12300 \u25105 3\u26376 20\u21495 \u20511 \u30340 \u20070 \u12301 \u30452 \u25509 \u31639 \u21040 \u26399 \u26102 \u38388 </li>\
                    <li>\uc0\u20063 \u25903 \u25345 \u33945 \u35821 \u25552 \u38382 \u21734 \u65281 </li>\
                </ul>\
            </div>\
        </div>\
        ''', unsafe_allow_html=True)\
\
    # \uc0\u32842 \u22825 \u23481 \u22120 \
    st.markdown('<div class="chat-container">', unsafe_allow_html=True)\
\
    # \uc0\u26174 \u31034 \u21382 \u21490 \u28040 \u24687 \
    if len(st.session_state.messages) > 6:\
        with st.expander(f"\uc0\u55357 \u56540  \u26597 \u30475 \u23436 \u25972 \u23545 \u35805 \u21382 \u21490 \u65288 \u20849 \{len(st.session_state.messages)\}\u26465 \u65289 ", expanded=False):\
            for msg in st.session_state.messages:\
                if msg["role"] == "user":\
                    st.markdown(f'<div class="user-message">\uc0\u55357 \u56420  \{msg["content"]\}</div>', unsafe_allow_html=True)\
                else:\
                    st.markdown(f'''\
                    <div class="assistant-message">\
                        \uc0\u55357 \u56538  \{msg["content"]\}\
                        <button class="copy-btn" onclick='navigator.clipboard.writeText(`\{msg["content"]\}`)'>\uc0\u22797 \u21046 </button>\
                        <div style='clear: both;'></div>\
                    </div>\
                    ''', unsafe_allow_html=True)\
    else:\
        for msg in st.session_state.messages:\
            if msg["role"] == "user":\
                st.markdown(f'<div class="user-message">\uc0\u55357 \u56420  \{msg["content"]\}</div>', unsafe_allow_html=True)\
            else:\
                st.markdown(f'''\
                <div class="assistant-message">\
                    \uc0\u55357 \u56538  \{msg["content"]\}\
                    <button class="copy-btn" onclick='navigator.clipboard.writeText(`\{msg["content"]\}`)'>\uc0\u22797 \u21046 </button>\
                    <div style='clear: both;'></div>\
                </div>\
                ''', unsafe_allow_html=True)\
\
    st.markdown('</div>', unsafe_allow_html=True)\
\
    # \uc0\u29992 \u25143 \u36755 \u20837 \
    prompt = st.chat_input("\uc0\u35831 \u38382 \u24744 \u26377 \u20160 \u20040 \u38382 \u39064 \u65311 \u25903 \u25345 \u20013 \u25991 /\u33945 \u35821 \u21734 ~", key="prompt")\
\
    if prompt:\
        st.session_state.messages.append(\{"role": "user", "content": prompt\})\
        st.rerun()\
\
    # \uc0\u22788 \u29702 \u22238 \u22797 \
    if st.session_state.messages and st.session_state.messages[-1]["role"] == "user":\
        user_query = st.session_state.messages[-1]["content"]\
        kb = get_full_kb()\
        \
        answer = find_best_match(user_query, kb)\
        if not answer:\
            answer = "\uc0\u25265 \u27465 \u65292 \u36825 \u20010 \u38382 \u39064 \u25105 \u26242 \u26102 \u36824 \u19981 \u30693 \u36947 \u65292 \u24744 \u21487 \u20197 \u35797 \u35797 \u38382 \u25105 \u20511 \u38405 \u35268 \u21017 \u12289 \u33258 \u20064 \u23460 \u39044 \u32422 \u12289 WiFi\u12289 \u25171 \u21360 \u30456 \u20851 \u30340 \u38382 \u39064 \u21734 \u65281 \u20063 \u21487 \u20197 \u33258 \u24049 \u22312 \u20391 \u36793 \u26639 \u28155 \u21152 \u26032 \u30340 \u38382 \u31572 ~ \u25903 \u25345 \u20013 \u25991 /\u33945 \u35821 \u21452 \u35821 \u21734 \u65281 "\
        \
        # \uc0\u25171 \u23383 \u26426 \u25928 \u26524 \
        placeholder = st.empty()\
        full_answer = answer\
        current_text = ""\
        for char in full_answer:\
            current_text += char\
            placeholder.markdown(f'''\
            <div class="chat-container">\
                <div class="assistant-message">\
                    \uc0\u55357 \u56538  \{current_text\}\u9612 \
                </div>\
            </div>\
            ''', unsafe_allow_html=True)\
            time.sleep(0.02)\
        \
        placeholder.markdown(f'''\
        <div class="chat-container">\
            <div class="assistant-message">\
                \uc0\u55357 \u56538  \{full_answer\}\
                <button class="copy-btn" onclick='navigator.clipboard.writeText(`\{full_answer\}`)'>\uc0\u22797 \u21046 </button>\
                <div style='clear: both;'></div>\
            </div>\
        </div>\
        ''', unsafe_allow_html=True)\
        \
        st.session_state.messages.append(\{"role": "assistant", "content": full_answer\})\
        st.rerun()\
\
# --- \uc0\u26631 \u31614 2\u65306 \u39302 \u34255 \u26597 \u35810  ---\
with tab2:\
    st.markdown('''\
    <div class="card">\
        <h3>\uc0\u55357 \u56589  \u39302 \u34255 \u26597 \u35810 </h3>\
        <p>\uc0\u36755 \u20837 \u20070 \u21517 \u65292 \u23601 \u33021 \u26597 \u21040 \u36825 \u26412 \u20070 \u30340 \u20301 \u32622 \u21644 \u21487 \u20511 \u29366 \u24577 \u65281 </p>\
    </div>\
    ''', unsafe_allow_html=True)\
    \
    book_name = st.text_input("\uc0\u35831 \u36755 \u20837 \u20070 \u21517 ")\
    if st.button("\uc0\u26597 \u35810 "):\
        if book_name:\
            match = None\
            match_name = None\
            for name, info in book_collection.items():\
                if book_name in name or name in book_name:\
                    match = info\
                    match_name = name\
                    break\
            if match:\
                st.success(f"\uc0\u9989  \u25214 \u21040 \u12298 \{match_name\}\u12299 \u21862 \u65281 ")\
                col1, col2, col3 = st.columns(3)\
                with col1:\
                    st.metric("\uc0\u25152 \u22312 \u27004 \u23618 ", match['floor'])\
                with col2:\
                    st.metric("\uc0\u20855 \u20307 \u20301 \u32622 ", match['location'])\
                with col3:\
                    if match['status'] == "\uc0\u22312 \u26550 \u21487 \u20511 ":\
                        st.metric("\uc0\u21487 \u20511 \u29366 \u24577 ", "\u9989  \u21487 \u20511 ")\
                    else:\
                        st.metric("\uc0\u21487 \u20511 \u29366 \u24577 ", f"\u10060  \u24050 \u20511 \u20986 \u65292 \u39044 \u35745 \{match['return_date']\}\u24402 \u36824 ")\
            else:\
                st.warning("\uc0\u25265 \u27465 \u65292 \u26242 \u26102 \u27809 \u26377 \u25214 \u21040 \u36825 \u26412 \u20070 \u30340 \u20449 \u24687 \u65292 \u20320 \u21487 \u20197 \u35797 \u35797 \u20854 \u20182 \u20070 \u21517 ~")\
\
# --- \uc0\u26631 \u31614 3\u65306 \u24231 \u20301 \u29366 \u24577  ---\
with tab3:\
    st.markdown('''\
    <div class="card">\
        <h3>\uc0\u55358 \u56977  \u33258 \u20064 \u23460 \u24231 \u20301 \u29366 \u24577 </h3>\
        <p>\uc0\u23454 \u26102 \u26597 \u30475 \u21508 \u27004 \u23618 \u21097 \u20313 \u31354 \u20301 \u65292 \u20877 \u20063 \u19981 \u29992 \u36305 \u31354 \u21862 \u65281 </p>\
    </div>\
    ''', unsafe_allow_html=True)\
    \
    for floor, status in seat_status.items():\
        with st.container():\
            col1, col2, col3, col4 = st.columns(4)\
            with col1:\
                st.write(f"**\{floor\}**")\
            with col2:\
                st.write(f"\uc0\u24635 \u24231 \u20301 : \{status['total']\}")\
            with col3:\
                st.write(f"\uc0\u21097 \u20313 \u31354 \u20301 : \{status['left']\}")\
            with col4:\
                if status['full']:\
                    st.error("\uc0\u9888 \u65039  \u21363 \u23558 \u28385 \u24231 ")\
                else:\
                    st.success("\uc0\u9989  \u31354 \u20301 \u20805 \u36275 ")\
            st.divider()\
    \
    st.info("\uc0\u55357 \u56481  \u20320 \u21487 \u20197 \u28857 \u20987 \u20391 \u36793 \u26639 \u30340 \u12300 \u33258 \u20064 \u23460 \u24590 \u20040 \u39044 \u32422 \u12301 \u65292 \u26597 \u30475 \u39044 \u32422 \u26041 \u27861 \u21734 \u65281 ")\
\
# --- \uc0\u26631 \u31614 4\u65306 \u26412 \u21608 \u26032 \u20070  ---\
with tab4:\
    st.markdown('''\
    <div class="card">\
        <h3>\uc0\u55357 \u56534  \u26412 \u21608 \u26032 \u20070 \u25512 \u33616 </h3>\
        <p>\uc0\u26368 \u26032 \u21040 \u39302 \u30340 \u22909 \u20070 \u65292 \u24555 \u26469 \u30475 \u30475 \u26377 \u27809 \u26377 \u20320 \u24819 \u35201 \u30340 \u65281 </p>\
    </div>\
    ''', unsafe_allow_html=True)\
    \
    col1, col2 = st.columns(2)\
    for i, book in enumerate(new_books):\
        if i % 2 == 0:\
            with col1:\
                with st.container():\
                    st.markdown(f'''\
                    <div class="card">\
                        <h4>\uc0\u55357 \u56533  \{book['name']\}</h4>\
                        <p>\uc0\u20316 \u32773 : \{book['author']\}</p>\
                        <p>\uc0\u20301 \u32622 : \{book['floor']\}</p>\
                    </div>\
                    ''', unsafe_allow_html=True)\
        else:\
            with col2:\
                with st.container():\
                    st.markdown(f'''\
                    <div class="card">\
                        <h4>\uc0\u55357 \u56533  \{book['name']\}</h4>\
                        <p>\uc0\u20316 \u32773 : \{book['author']\}</p>\
                        <p>\uc0\u20301 \u32622 : \{book['floor']\}</p>\
                    </div>\
                    ''', unsafe_allow_html=True)\
}