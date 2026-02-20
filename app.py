import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import griddata, make_interp_spline
import os

st.set_page_config(layout="wide")
st.title("OEM Pump Performance Curve Generator")

# ===============================
# FILE LOADING WITH SMART ENCODING
# ===============================

DATA_FILE = "test.csv"

if not os.path.exists(DATA_FILE):
    st.error("❌ test.csv not found in project directory.")
    st.stop()

# Try multiple encodings safely
encodings_to_try = ["utf-8", "latin1", "ISO-8859-1", "cp1252"]

df = None
for enc in encodings_to_try:
    try:
        df = pd.read_csv(DATA_FILE, encoding=enc)
        st.success(f"Loaded file using encoding: {enc}")
        break
    except:
        continue

if df is None:
    st.error("❌ Unable to read test.csv with common encodings.")
    st.stop()

df.columns = df.columns.str.strip()


# ===============================
# FILTER SECTION
# ===============================

pump_list = df["PumpType"].dropna().unique()

if len(pump_list) == 0:
    st.error("❌ No PumpType data available.")
    st.stop()

selected_pumps = st.multiselect("Select Pump(s)", pump_list, default=[pump_list[0]])

stage_list = df[df["PumpType"].isin(selected_pumps)]["Stages"].dropna().unique()

if len(stage_list) == 0:
    st.warning("⚠ No stage data for selected pump.")
    st.stop()

selected_stage = st.selectbox("Select Stage", stage_list)

test_type = st.selectbox("Test Type", ["SP", "DP"])

filtered = df[
    (df["PumpType"].isin(selected_pumps)) &
    (df["Stages"] == selected_stage) &
    (df["Test_Type_ID"] == test_type)
].copy()

if filtered.empty:
    st.warning("⚠ No data found for selected filters.")
    st.stop()

# ===============================
# SPEED NORMALIZATION
# ===============================

valid_speed = filtered["Speed"].replace(0, np.nan).dropna()

if len(valid_speed) == 0:
    st.error("❌ Invalid Speed values. Cannot normalize.")
    st.stop()

rated_speed = st.number_input("Rated Speed (RPM)", value=int(valid_speed.mean()))

filtered["Norm_Flow"] = filtered["Flow"] * (rated_speed / filtered["Speed"])
filtered["Norm_Head"] = filtered["Total_Head"] * (rated_speed / filtered["Speed"])**2

page = st.radio("View Mode", ["H-Q Curve", "Efficiency Iso-Lines", "Efficiency vs Flow"])

# ===============================
# H-Q CURVE
# ===============================

if page == "H-Q Curve":

    fig, ax = plt.subplots()

    for pump in selected_pumps:
        sub_pump = filtered[filtered["PumpType"] == pump]

        for dia in sub_pump["Pump_Detail_Impeller_Dia_1st_Stage"].dropna().unique():

            subset = sub_pump[
                sub_pump["Pump_Detail_Impeller_Dia_1st_Stage"] == dia
            ].sort_values("Norm_Flow")

            if subset.empty:
                continue

            # Smooth curve if enough points
            if len(subset) > 3:
                try:
                    x = subset["Norm_Flow"]
                    y = subset["Norm_Head"]
                    x_new = np.linspace(x.min(), x.max(), 200)
                    spline = make_interp_spline(x, y, k=3)
                    y_smooth = spline(x_new)
                    ax.plot(x_new, y_smooth)
                except:
                    ax.plot(subset["Norm_Flow"], subset["Norm_Head"])
            else:
                ax.plot(subset["Norm_Flow"], subset["Norm_Head"])

            # BEP Marking
            if "Pump_Efficiency" in subset.columns:
                try:
                    bep = subset.loc[subset["Pump_Efficiency"].idxmax()]
                    ax.scatter(bep["Norm_Flow"], bep["Norm_Head"])
                except:
                    pass

            # Shutoff
            shutoff = subset.loc[subset["Norm_Flow"].idxmin()]
            ax.scatter(shutoff["Norm_Flow"], shutoff["Norm_Head"])

            # Runout
            runout = subset.loc[subset["Norm_Flow"].idxmax()]
            ax.scatter(runout["Norm_Flow"], runout["Norm_Head"])

            # NPSHr overlay (if exists)
            if "hs" in subset.columns:
                try:
                    ax.plot(subset["Norm_Flow"], subset["hs"])
                except:
                    pass

    ax.set_xlabel("Flow (Q)")
    ax.set_ylabel("Head (H)")
    ax.grid(True)
    st.pyplot(fig)

# ===============================
# EFFICIENCY ISO-LINES
# ===============================

elif page == "Efficiency Iso-Lines":

    if "Pump_Efficiency" not in filtered.columns:
        st.warning("⚠ Pump_Efficiency column not available.")
        st.stop()

    try:
        flow_vals = filtered["Norm_Flow"].values
        head_vals = filtered["Norm_Head"].values
        eff_vals = filtered["Pump_Efficiency"].values

        F_grid = np.linspace(flow_vals.min(), flow_vals.max(), 100)
        H_grid = np.linspace(head_vals.min(), head_vals.max(), 100)
        F, H = np.meshgrid(F_grid, H_grid)

        E = griddata((flow_vals, head_vals), eff_vals, (F, H), method='linear')

        fig, ax = plt.subplots()
        contour = ax.contour(F, H, E, levels=6)
        ax.clabel(contour, inline=True)
        ax.set_xlabel("Flow (Q)")
        ax.set_ylabel("Head (H)")
        ax.grid(True)
        st.pyplot(fig)

    except Exception as e:
        st.error(f"❌ Unable to generate iso-lines: {e}")

# ===============================
# EFFICIENCY VS FLOW
# ===============================

elif page == "Efficiency vs Flow":

    if "Pump_Efficiency" not in filtered.columns:
        st.warning("⚠ Pump_Efficiency column not available.")
        st.stop()

    fig, ax = plt.subplots()

    for pump in selected_pumps:
        sub_pump = filtered[filtered["PumpType"] == pump]

        for dia in sub_pump["Pump_Detail_Impeller_Dia_1st_Stage"].dropna().unique():

            subset = sub_pump[
                sub_pump["Pump_Detail_Impeller_Dia_1st_Stage"] == dia
            ].sort_values("Norm_Flow")

            if subset.empty:
                continue

            if len(subset) > 3:
                try:
                    x = subset["Norm_Flow"]
                    y = subset["Pump_Efficiency"]
                    x_new = np.linspace(x.min(), x.max(), 200)
                    spline = make_interp_spline(x, y, k=3)
                    y_smooth = spline(x_new)
                    ax.plot(x_new, y_smooth)
                except:
                    ax.plot(subset["Norm_Flow"], subset["Pump_Efficiency"])
            else:
                ax.plot(subset["Norm_Flow"], subset["Pump_Efficiency"])

    ax.set_xlabel("Flow (Q)")
    ax.set_ylabel("Efficiency (%)")
    ax.grid(True)
    st.pyplot(fig)
