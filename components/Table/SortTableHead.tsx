import React, { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import SortDownIcon from 'assets/svg/app/caret-down.svg';
import SortUpIcon from 'assets/svg/app/caret-up.svg';

type SortTableHeadProps = {
	sortable: boolean;
	isSorted: boolean;
	isSortedDesc: boolean;
};

export const SortTableHead: FC<SortTableHeadProps> = ({ sortable, isSorted, isSortedDesc }) => {
	if (!sortable) return null;

	let sortIcon;
	if (!isSorted) {
		sortIcon = (
			<>
				<StyledSortIcon src={SortUpIcon} viewBox={`0 0 ${SortUpIcon.width} ${SortUpIcon.height}`} />
				<StyledSortIcon
					src={SortDownIcon}
					viewBox={`0 0 ${SortDownIcon.width} ${SortDownIcon.height}`}
				/>
			</>
		);
	} else if (isSortedDesc) {
		sortIcon = (
			<StyledSortIcon
				src={SortDownIcon}
				viewBox={`0 0 ${SortDownIcon.width} ${SortDownIcon.height}`}
			/>
		);
	} else {
		sortIcon = (
			<StyledSortIcon src={SortUpIcon} viewBox={`0 0 ${SortUpIcon.width} ${SortUpIcon.height}`} />
		);
	}

	return <SortIconContainer>{sortIcon}</SortIconContainer>;
};

const SortIconContainer = styled.span`
	display: flex;
	margin-left: 5px;
	flex-direction: column;
`;

const StyledSortIcon = styled(Svg)`
	width: 5px;
	height: 5px;
	color: ${(props) => props.theme.colors.gray};
`;
