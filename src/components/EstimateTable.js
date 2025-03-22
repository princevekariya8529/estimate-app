import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";

export default function Estimate() {
    const [sections, setSections] = useState([]);
    const [grandTotal, setGrandTotal] = useState(0);

    useEffect(() => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "/React JS-Estimate_detail.json", true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (!response.data || !response.data.sections || !Array.isArray(response.data.sections)) {
                        return;
                    }

                    const formattedData = response.data.sections.map((section) => ({
                        id: section.section_id,
                        name: section.section_name,
                        items:
                            section.items?.map((item) => ({
                                id: item.item_id,
                                type: item.item_type_display_name,
                                name: item.subject,
                                quantity: item.quantity || 0,
                                unit: item.unit,
                                unit_cost: parseFloat(item.unit_cost) / 100,
                                total: parseFloat(item.total) / 100,
                                tax: item.apply_global_tax || false,
                                cost_code: item.cost_code || "",
                            })) || [],
                    }));

                    setSections(formattedData);
                    calculateGrandMainTotal(formattedData);
                } catch (error) {
                    console.error("Error", error);
                }
            }
        };
        xhr.send();
    }, []);

    const handleInputChange = (sectionIndex, itemIndex, field, value) => {
        const updatedSections = [...sections];
        let item = updatedSections[sectionIndex].items[itemIndex];
        item[field] = field === "tax" ? value : parseFloat(value) || 0;
        item.total = item.quantity * item.unit_cost;

        calculateGrandMainTotal(updatedSections);
        setSections(updatedSections);
    };

    const calculateGrandMainTotal = (updatedSections) => {
        let total = updatedSections.reduce(
            (sum, section) =>
                sum +
                section.items.reduce((secSum, item) => secSum + item.total, 0),
            0
        );
        setGrandTotal(total);
    };

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-2xl font-bold mb-4">Estimate</h1>
            <h2 className="text-xl font-semibold">Grand Total: ${grandTotal.toFixed(2)}</h2>

            {sections.map((section, sectionIndex) => (
                <div key={section.id} className="mt-5 border p-3 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center bg-gray-200 p-2">
                        <h3 className="text-lg font-bold">{section.name}</h3>
                        <span className="text-green-600 font-semibold">
                            ${section.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                        </span>
                    </div>
                    <table className="w-full border-collapse border border-gray-300 mt-3">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">Type</th>
                                <th className="border p-2">Item Name</th>
                                <th className="border p-2">QTY</th>
                                <th className="border p-2">Unit Cost</th>
                                <th className="border p-2">Unit</th>
                                <th className="border p-2">Total</th>
                                <th className="border p-2">Tax</th>
                                <th className="border p-2">Cost Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {section.items.map((item, itemIndex) => (
                                <tr key={item.id} className="border">
                                    <td className="border p-2">{item.type}</td>
                                    <td className="border p-2">{item.name}</td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleInputChange(sectionIndex, itemIndex, "quantity", e.target.value)
                                            }
                                            className="border w-full p-1"
                                        />
                                    </td>
                                    <td className="border p-2">
                                        <input
                                            type="number"
                                            value={item.unit_cost}
                                            onChange={(e) =>
                                                handleInputChange(sectionIndex, itemIndex, "unit_cost", e.target.value)
                                            }
                                            className="border w-full p-1"
                                        />
                                    </td>
                                    <td className="border p-2">{item.unit}</td>
                                    <td className="border p-2">${item.total.toFixed(2)}</td>
                                    <td className="border p-2 text-center justify-items-center">
                                        {
                                            item.tax == 1 ? <FaCheck /> : <IoCloseSharp />
                                        }
                                    </td>
                                    <td className="border p-2">{item.cost_code}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}

            <div className="mt-5 p-3 bg-gray-100 text-right font-bold text-xl">
                Grand Total: <span className="text-green-600">${grandTotal.toFixed(2)}</span>
            </div>
        </div>
    );
}
