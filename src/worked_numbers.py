"""Every worked number used on the slides, computed once. Run: python3 src/worked_numbers.py"""
from fractions import Fraction as F

print("== M1: ten men, both futures (illustrative)")
# (name, drinks, Y if smokes, Y if never smokes)
men = [("Murugan",1,1,0),("Selvam",1,1,1),("Ravi",1,1,0),("Kannan",1,1,1),
       ("Arul",0,1,0),("Suresh",0,1,0),("Bala",0,0,0),("Mani",0,0,0),("Raja",0,0,0),("Siva",0,0,0)]
y1=sum(m[2] for m in men); y0=sum(m[3] for m in men)
print(" deaths if all smoked", y1, "/10; if none smoked", y0, "/10; RD", F(y1-y0,10), "RR", F(y1,y0))
for t,f in [("doomed",lambda m:m[2] and m[3]),("smoking-caused",lambda m:m[2] and not m[3]),("immune",lambda m:not m[2] and not m[3])]:
    print("  ",t,[m[0] for m in men if f(m)])

print("== M2: who actually smoked (drinkers smoke more)")
smoked={"Murugan","Selvam","Ravi","Arul"}
S=[m for m in men if m[0] in smoked]; N=[m for m in men if m[0] not in smoked]
rs=F(sum(m[2] for m in S),len(S)); rn=F(sum(m[3] for m in N),len(N))
print(" smokers died", sum(m[2] for m in S),"/",len(S)," non-smokers died",sum(m[3] for m in N),"/",len(N)," observed RR", rs/rn, float(rs/rn))
print(" exchangeability check: smokers' risk had they NOT smoked =", F(sum(m[3] for m in S),len(S)), " vs non-smokers' actual", rn)

print("== M2/M6: 100 men (Lab 1)")
# drinkers 40: doomed10 causal20 immune10; smokers 24 = 6,12,6. non 60: doomed3 causal6 immune51; smokers 20 = 1,2,17
grp={'D':dict(n=40,smk=24,y1=30,y0=10,s_y1=18,n_y0=4),'N':dict(n=60,smk=20,y1=9,y0=3,s_y1=3,n_y0=2)}
T1=sum(g['y1'] for g in grp.values()); T0=sum(g['y0'] for g in grp.values())
print(" causal RR", F(T1,T0))
sd=sum(g['s_y1'] for g in grp.values()); sn=sum(g['smk'] for g in grp.values())
nd=sum(g['n_y0'] for g in grp.values()); nn=sum(g['n']-g['smk'] for g in grp.values())
print(" observed", sd,"/",sn," vs ",nd,"/",nn,"  RR", round((sd/sn)/(nd/nn),2))
for k,g in grp.items(): print("  stratum",k, g['s_y1'],"/",g['smk']," vs ",g['n_y0'],"/",g['n']-g['smk'],"  RR", F(g['s_y1']*(g['n']-g['smk']), g['n_y0']*g['smk']))
# standardised to whole population (weights 40,60)
rs_std=(40*F(18,24)+60*F(3,20))/100; rn_std=(40*F(4,16)+60*F(2,40))/100
print(" standardised risks", rs_std, float(rs_std), rn_std, float(rn_std), "RR", rs_std/rn_std)

print("== M6: fork with NO effect (1000 men)")
D=400; Nd=600; ps_d=F(3,4); ps_n=F(1,4); r_d=F(1,10); r_n=F(2,100)
sm_d=D*ps_d; sm_n=Nd*ps_n
dead_s=sm_d*r_d+sm_n*r_n; dead_n=(D-sm_d)*r_d+(Nd-sm_n)*r_n
print(" smokers", sm_d+sm_n, "deaths", dead_s, " non-smokers", D-sm_d+Nd-sm_n, "deaths", dead_n)
print(" crude RR", float((dead_s/(sm_d+sm_n))/(dead_n/(D-sm_d+Nd-sm_n))), "risks", float(dead_s/(sm_d+sm_n)), float(dead_n/(D-sm_d+Nd-sm_n)))

print("== M7: chain, all effect through LBW (per 100,000 births)")
pl_s=F(14,100); pl_n=F(5,100); dl=F(4,100); dn=F(4,1000)
rs=pl_s*dl+(1-pl_s)*dn; rn=pl_n*dl+(1-pl_n)*dn
print(" smokers' risk", float(rs)*1e5, " non", float(rn)*1e5, " RR", round(float(rs/rn),2), " within LBW", dl/dl, " within normal", dn/dn)

print("== M8: Berkson, 100,000 people, smoking 30%, TB 1%, independent")
N=100000; pS=F(3,10); pT=F(1,100)
cells={(s,t):N*(pS if s else 1-pS)*(pT if t else 1-pT) for s in (1,0) for t in (1,0)}
print(" community", {k:int(v) for k,v in cells.items()}, " OR", (cells[1,1]*cells[0,0])/(cells[1,0]*cells[0,1]))
adm={(1,1):F(9,10),(0,1):F(8,10),(1,0):F(5,100),(0,0):F(2,100)}
h={k:cells[k]*adm[k] for k in cells}
print(" hospital", {k:float(v) for k,v in h.items()}, " OR", round(float((h[1,1]*h[0,0])/(h[1,0]*h[0,1])),2))

print("== M2 your turn: a balanced assignment of the ten men")
smoked2={"Murugan","Kannan","Arul","Mani","Raja"}
S=[m for m in men if m[0] in smoked2]; N=[m for m in men if m[0] not in smoked2]
a=sum(m[2] for m in S); b=sum(m[3] for m in N)
print(" smokers died",a,"/",len(S)," non-smokers died",b,"/",len(N)," RR",F(a*len(N),b*len(S)), " drinkers among smokers", sum(m[1] for m in S), "among non", sum(m[1] for m in N))
print("== M2 coin toss on average: half of every type smokes")
print(" smokers risk", F(39,2)/50, " non-smokers risk", F(13,2)/50, " RR", (F(39,2)/50)/(F(13,2)/50))

print("== M6 fork no-effect strata")
print(" drinkers: smokers 300 deaths", 300*F(1,10), " non-smokers 100 deaths", 100*F(1,10))
print(" non-drinkers: smokers 150 deaths", 150*F(2,100), " non-smokers 450 deaths", 450*F(2,100))
print("== M6 your turn standardisation: drinkers 30%")
a=F(3,10)*F(1,2)+F(7,10)*F(1,10); b=F(3,10)*F(1,4)+F(7,10)*F(1,20)
print(" std risk smoked", a, float(a), " not", b, float(b), " RR", a/b)

print("== M8 birth weight model (Lab 3 default)")
pU=F(2,100); L={(1,1):F(55,100),(1,0):F(14,100),(0,1):F(50,100),(0,0):F(5,100)}
for s in (1,0):
    a=pU*L[s,1]; b=(1-pU)*L[s,0]; print(" smoker" if s else " non-smoker", "share of LBW babies with defect", round(float(a/(a+b))*100,1), "%")
print(" published: 1235/805 =", round(1235/805,2))

print("== Lab 1 step 5: smokers' risk had they not smoked")
print(" doomed among smokers: 6 drinkers + 1 non-drinker = 7 of 44 =", round(7/44,3), " non-smokers actual 6/56 =", round(6/56,3))

print("== M3: 'ever smoked' as a mix of versions (illustrative): never 1%, bidi 6%, cigarette 2%")
for pb in (F(7,10), F(3,10)):
    r = pb*F(6,100) + (1-pb)*F(2,100); print(f" bidi share {pb}: smokers' risk {float(r)*100:.1f}%  RR {float(r/F(1,100)):.1f}")

print("== M4: pies, 100 TB deaths: A (Mtb+smoking+undernutrition) 50, B (Mtb+HIV+diabetes) 30, C (Mtb+smoking+HIV) 20")
pies={'A':(50,{'mtb','smk','nut'}),'B':(30,{'mtb','hiv','dm'}),'C':(20,{'mtb','smk','hiv'})}
tot=0
for c in ['mtb','smk','nut','hiv','dm']:
    f=sum(n for n,s in pies.values() if c in s); tot+=f; print(f"  removing {c} prevents {f}%")
print("  sum", tot, "%")
print("== M4: complementary cause prevalence. Disease needs smoking + U; background 1%; 10% of smokers with U fall ill")
for pu in (F(4,10), F(4,100)):
    rs = F(1,100) + pu*F(1,10); print(f"  U prevalence {pu}: smokers' risk {float(rs)*100:.1f}%  RR {float(rs/F(1,100)):.1f}")

print("== M9: non-differential misclassification, cohort 1000 exposed (10%), 1000 unexposed (5%), Se 0.8, Sp 0.9")
Se,Sp=F(8,10),F(9,10)
ce,ne,cu,nu=100,1000,50,1000
rec_e_c = Se*ce + (1-Sp)*cu; rec_e_n = Se*ne + (1-Sp)*nu
rec_u_c = (1-Se)*ce + Sp*cu; rec_u_n = (1-Se)*ne + Sp*nu
print(" recorded exposed:", rec_e_c, "/", rec_e_n, round(float(rec_e_c/rec_e_n)*100,2),"%  unexposed:", rec_u_c,"/",rec_u_n, round(float(rec_u_c/rec_u_n)*100,2),"%  RR", round(float((rec_e_c/rec_e_n)/(rec_u_c/rec_u_n)),2), " true RR 2.0")
print("== M9: differential (recall), case-control 200/200, true exposed 100 cases 50 controls, cases report Se .95, controls .80, Sp 1")
a,b=100*F(95,100),100+100*F(5,100); c,d=50*F(8,10),150+50*F(2,10)
print(" true OR", F(100*150,100*50), " recorded cases", a, b, " controls", c, d, " OR", round(float(a*d/(b*c)),2))

print("== M11: education -> fuel -> ARI, no direct effect; reporting x1.2 among educated")
pb_u, pb_e = F(6,10), F(2,10); r_b, r_c = F(15,100), F(10,100)
ru = pb_u*r_b+(1-pb_u)*r_c; re = pb_e*r_b+(1-pb_e)*r_c
print(" true risk uneducated", float(ru), " educated", float(re), " total RR", round(float(re/ru),3))
print(" fuel-adjusted true RR 1.0; with reporting x1.2: fuel-adjusted 1.2, total", round(float(re/ru*F(12,10)),3))

print("== M12: external adjustment for alcohol: p1 0.6 smokers, p0 0.25 non, RR_UD 3, observed 4.5")
p1,p0,RRud,obs=F(6,10),F(1,4),3,F(9,2)
bias=(p1*(RRud-1)+1)/(p0*(RRud-1)+1)
print(" bias factor", bias, float(bias), " adjusted RR", round(float(obs/bias),2))
for (a1,a0,r) in [(F(6,10),F(1,4),2),(F(6,10),F(1,4),5),(F(8,10),F(1,5),5)]:
    bf=(a1*(r-1)+1)/(a0*(r-1)+1); print(f"  p1 {a1} p0 {a0} RRud {r}: bias {float(bf):.2f} adjusted {float(obs/bf):.2f}")
import math
for R in (4.5, 1.10):
    print(f" E-value for RR {R}: {R+math.sqrt(R*(R-1)):.2f}")
print(" E-value for OR 1.10 treated as RR: as above")

print("== M13: immortal time, 200 identical patients, no drug effect")
early=20; alive=180; users=90; nonusers=90; d_late=9
print(" naive (ever-users from day 0): users", d_late,"/",users, f"{d_late/users:.2f}", " non-users", d_late+early,"/",nonusers+early, f"{(d_late+early)/(nonusers+early):.2f}", " RR", round((d_late/users)/((d_late+early)/(nonusers+early)),2))
print(" time zero at month 6: 9/90 vs 9/90 RR 1.0")

print("== M9 lab differential cohort: case Se .95, non-case Se .80, Sp 1")
a,c,b,d=100,50,900,950
Ec=.95*a; Uc=c+.05*a; En=.8*b; Un=d+.2*b
print(" RR", round((Ec/(Ec+En))/(Uc/(Uc+Un)),3))
print("== M12 your turn: p1 .5 p0 .2 RRud 2")
print(" bias", (0.5*1+1)/(0.2*1+1), " corrected", round(4.5/((0.5+1)/(0.2+1)),2))

print("== M1a trial dilution: 0.5*10+0.5*20 =", 0.5*10+0.5*20, "; your turn 0.6*15+0.4*30 =", 0.6*15+0.4*30)
print("== M1b ATE/ATT/ATC:", 0.6*-1.5+0.4*-0.2, 0.8*-1.5+0.2*-0.2, 0.4*-1.5+0.6*-0.2, "; treated share t from 0.8t+0.4(1-t)=0.6:", (0.6-0.4)/0.4)
print("== M1c NNT 1/.01, 1/.10:", 1/.01, 1/.10, "; statin Ravi", 0.04*0.25, 1/(0.04*0.25), "Shanti", 0.24*0.25, round(1/(0.24*0.25),1))
